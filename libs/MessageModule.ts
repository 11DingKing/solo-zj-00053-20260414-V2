import { DiscoveryService, DiscoveryModule } from '@nestjs-plus/discovery';
import {
  Global,
  Inject,
  Logger,
  Module,
  OnModuleDestroy,
  SetMetadata,
} from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import { IEvent } from '@nestjs/cqrs';
import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient,
  MessageAttributeValue,
} from '@aws-sdk/client-sqs';
import {
  CreateTopicCommand,
  SNSClient,
  PublishCommand,
} from '@aws-sdk/client-sns';
import { Interval } from '@nestjs/schedule';

import { RequestStorage } from 'libs/RequestStorage';
import { BusinessError } from 'libs/errors/BusinessError';

import { Config } from 'src/Config';

type Message = Readonly<{
  name: string;
  body: IEvent;
  requestId: string;
  taskId?: string;
  retryCount?: number;
  maxRetries?: number;
}>;

type MessageHandlerMetadata = Readonly<{ name: string }>;

const SQS_CONSUMER_METHOD = Symbol.for('SQS_CONSUMER_METHOD');
export const MessageHandler = (name: string) =>
  SetMetadata<symbol, MessageHandlerMetadata>(SQS_CONSUMER_METHOD, { name });

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_SECONDS = 1;
const MAX_RETRY_DELAY_SECONDS = 30;

function calculateExponentialBackoffDelay(retryCount: number): number {
  const delay = INITIAL_RETRY_DELAY_SECONDS * Math.pow(2, retryCount);
  return Math.min(delay, MAX_RETRY_DELAY_SECONDS) + Math.random();
}

class SQSConsumerService implements OnModuleDestroy {
  private readonly logger = new Logger(SQSConsumerService.name);
  @Inject() private readonly discover: DiscoveryService;
  @Inject() private readonly modulesContainer: ModulesContainer;
  private readonly sqsClient = new SQSClient({
    region: Config.AWS_REGION,
    endpoint: Config.AWS_ENDPOINT,
    credentials: {
      accessKeyId: Config.AWS_ACCESS_KEY_ID,
      secretAccessKey: Config.AWS_SECRET_ACCESS_KEY,
    },
  });

  @Interval(5000)
  async handleMessage(): Promise<void> {
    RequestStorage.reset();
    const response = (
      await this.sqsClient.send(
        new ReceiveMessageCommand({
          QueueUrl: Config.AWS_SQS_QUEUE_URL,
          AttributeNames: ['All'],
          MessageAttributeNames: ['All'],
          MaxNumberOfMessages: 1,
          WaitTimeSeconds: 5,
        }),
      )
    ).Messages;
    if (!response || !response[0] || !response[0].Body) return;

    const message = (
      (JSON.parse(response[0].Body) as { Message?: string }).Message
        ? JSON.parse(
            (JSON.parse(response[0].Body) as { Message: string }).Message,
          )
        : JSON.parse(response[0].Body)
    ) as Message;
    RequestStorage.setRequestId(message.requestId);

    const handler = (
      await this.discover.controllerMethodsWithMetaAtKey<MessageHandlerMetadata>(
        SQS_CONSUMER_METHOD,
      )
    ).find((handler) => handler.meta.name === message.name);
    if (!handler) {
      await this.moveToDeadLetterQueue(
        message,
        `Message handler is not found. Message: ${JSON.stringify(message)}`,
      );
      await this.deleteMessage(response[0].ReceiptHandle);
      return;
    }

    const controller = Array.from(this.modulesContainer.values())
      .filter((module) => 0 < module.controllers.size)
      .flatMap((module) => Array.from(module.controllers.values()))
      .find(
        (wrapper) => wrapper.name == handler.discoveredMethod.parentClass.name,
      );
    if (!controller) {
      await this.moveToDeadLetterQueue(
        message,
        `Message handling controller is not found. Message: ${JSON.stringify(
          message,
        )}`,
      );
      await this.deleteMessage(response[0].ReceiptHandle);
      return;
    }

    try {
      await handler.discoveredMethod.handler.bind(controller.instance)(
        message.body,
      );
      await this.deleteMessage(response[0].ReceiptHandle);
      this.logger.log(
        `Message handling completed. Message: ${JSON.stringify(message)}`,
      );
    } catch (error) {
      const isBusinessError = error instanceof BusinessError;
      const retryCount = message.retryCount || 0;
      const maxRetries = message.maxRetries || MAX_RETRIES;

      if (isBusinessError) {
        this.logger.error(
          `Business error occurred, will not retry. Message: ${JSON.stringify(
            message,
          )}. Error: ${error}`,
        );
        await this.moveToDeadLetterQueue(message, error.message);
        await this.deleteMessage(response[0].ReceiptHandle);
        return;
      }

      if (retryCount < maxRetries) {
        const newRetryCount = retryCount + 1;
        const delaySeconds = Math.round(
          calculateExponentialBackoffDelay(newRetryCount),
        );

        this.logger.warn(
          `Retrying message (attempt ${newRetryCount}/${maxRetries}) after ${delaySeconds}s delay. Message: ${JSON.stringify(
            message,
          )}. Error: ${error}`,
        );

        await this.retryMessage(
          {
            ...message,
            retryCount: newRetryCount,
            maxRetries,
          },
          delaySeconds,
        );
        await this.deleteMessage(response[0].ReceiptHandle);
      } else {
        this.logger.error(
          `Message failed after ${maxRetries} retries, moving to dead letter queue. Message: ${JSON.stringify(
            message,
          )}. Error: ${error}`,
        );
        await this.moveToDeadLetterQueue(
          message,
          error instanceof Error ? error.message : String(error),
        );
        await this.deleteMessage(response[0].ReceiptHandle);
      }
    }
  }

  private async deleteMessage(receiptHandle: string | undefined): Promise<void> {
    if (!receiptHandle) return;
    await this.sqsClient.send(
      new DeleteMessageCommand({
        QueueUrl: Config.AWS_SQS_QUEUE_URL,
        ReceiptHandle: receiptHandle,
      }),
    );
  }

  private async retryMessage(
    message: Message,
    delaySeconds: number,
  ): Promise<void> {
    await this.sqsClient.send(
      new SendMessageCommand({
        QueueUrl: Config.AWS_SQS_QUEUE_URL,
        MessageBody: JSON.stringify(message),
        DelaySeconds: delaySeconds,
        MessageAttributes: {
          RetryCount: {
            DataType: 'Number',
            StringValue: String(message.retryCount || 0),
          } as MessageAttributeValue,
          MaxRetries: {
            DataType: 'Number',
            StringValue: String(message.maxRetries || MAX_RETRIES),
          } as MessageAttributeValue,
        },
      }),
    );
    this.logger.log(
      `Message queued for retry. Message: ${JSON.stringify(
        message,
      )}, Delay: ${delaySeconds}s`,
    );
  }

  private async moveToDeadLetterQueue(
    message: Message,
    errorReason: string,
  ): Promise<void> {
    const deadLetterQueueUrl = this.getDeadLetterQueueUrl();
    if (!deadLetterQueueUrl) {
      this.logger.warn(
        `Dead letter queue not configured. Message will be lost. Message: ${JSON.stringify(
          message,
        )}`,
      );
      return;
    }

    const deadLetterMessage = {
      ...message,
      originalMessage: JSON.stringify(message),
      errorReason,
      timestamp: new Date().toISOString(),
    };

    await this.sqsClient.send(
      new SendMessageCommand({
        QueueUrl: deadLetterQueueUrl,
        MessageBody: JSON.stringify(deadLetterMessage),
        MessageAttributes: {
          OriginalQueueUrl: {
            DataType: 'String',
            StringValue: Config.AWS_SQS_QUEUE_URL,
          } as MessageAttributeValue,
          ErrorReason: {
            DataType: 'String',
            StringValue: errorReason,
          } as MessageAttributeValue,
        },
      }),
    );
    this.logger.error(
      `Message moved to dead letter queue. Message: ${JSON.stringify(
        deadLetterMessage,
      )}`,
    );
  }

  private getDeadLetterQueueUrl(): string | null {
    const dlqUrl = process.env.AWS_SQS_DEAD_LETTER_QUEUE_URL;
    return dlqUrl || null;
  }

  onModuleDestroy(): void {
    this.sqsClient.destroy();
  }
}

export enum Topic {
  ACCOUNT_OPENED = 'AccountOpened',
  ACCOUNT_PASSWORD_UPDATED = 'AccountPasswordUpdated',
  ACCOUNT_CLOSED = 'AccountClosed',
  ACCOUNT_DEPOSITED = 'AccountDeposited',
  ACCOUNT_WITHDRAWN = 'AccountWithdrawn',
}

export class AccountOpened {
  constructor(readonly accountId: string, readonly email: string) {}
}

export class AccountPasswordUpdated {
  constructor(readonly accountId: string, readonly email: string) {}
}

export class AccountClosed {
  constructor(readonly accountId: string, readonly email: string) {}
}

export class AccountDeposited {
  constructor(readonly accountId: string, readonly email: string) {}
}

export class AccountWithdrawn {
  constructor(readonly accountId: string, readonly email: string) {}
}

class SNSMessagePublisher {
  private readonly snsClient = new SNSClient({
    region: Config.AWS_REGION,
    endpoint: Config.AWS_ENDPOINT,
    credentials: {
      accessKeyId: Config.AWS_ACCESS_KEY_ID,
      secretAccessKey: Config.AWS_SECRET_ACCESS_KEY,
    },
  });
  private readonly logger = new Logger(SNSMessagePublisher.name);

  async publish(Name: Topic, Message: Message): Promise<void> {
    const message = {
      TopicArn: (await this.snsClient.send(new CreateTopicCommand({ Name })))
        .TopicArn,
      Message: JSON.stringify(Message),
    };
    await this.snsClient.send(new PublishCommand(message));
    this.logger.log(`Message published. Message: ${JSON.stringify(message)}`);
  }
}

export interface IntegrationEventPublisher {
  publish: (name: Topic, body: IEvent) => Promise<void>;
}

class IntegrationEventPublisherImplement implements IntegrationEventPublisher {
  @Inject() private readonly snsMessagePublisher: SNSMessagePublisher;

  async publish(name: Topic, body: IEvent): Promise<void> {
    await this.snsMessagePublisher.publish(name, {
      name,
      body,
      requestId: RequestStorage.getStorage().requestId,
    });
  }
}

export const INTEGRATION_EVENT_PUBLISHER = 'IntegrationEventPublisher';

class SQSMessagePublisher {
  private readonly sqsClient = new SQSClient({
    region: Config.AWS_REGION,
    endpoint: Config.AWS_ENDPOINT,
  });
  private readonly logger = new Logger(SQSMessagePublisher.name);

  async publish(message: Message, delaySeconds?: number): Promise<void> {
    await this.sqsClient.send(
      new SendMessageCommand({
        QueueUrl: Config.AWS_SQS_QUEUE_URL,
        MessageBody: JSON.stringify(message),
        DelaySeconds: delaySeconds ?? Math.round(Math.random() * 10),
      }),
    );
    this.logger.log(`Message published. Message: ${JSON.stringify(message)}`);
  }
}

export interface TaskPublisher {
  publish: (
    name: string,
    task: IEvent,
    taskId?: string,
    maxRetries?: number,
  ) => Promise<string>;
}

class TaskPublisherImplement implements TaskPublisher {
  @Inject() private readonly sqsMessagePublisher: SQSMessagePublisher;

  async publish(
    name: string,
    body: IEvent,
    taskId?: string,
    maxRetries: number = MAX_RETRIES,
  ): Promise<string> {
    const generatedTaskId = taskId || this.generateTaskId();
    await this.sqsMessagePublisher.publish(
      {
        name,
        body,
        requestId: RequestStorage.getStorage().requestId,
        taskId: generatedTaskId,
        retryCount: 0,
        maxRetries,
      },
      0,
    );
    return generatedTaskId;
  }

  private generateTaskId(): string {
    return [...Array(32)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');
  }
}

export const TASK_PUBLISHER = 'TaskPublisher';

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [
    SQSConsumerService,
    SNSMessagePublisher,
    SQSMessagePublisher,
    {
      provide: INTEGRATION_EVENT_PUBLISHER,
      useClass: IntegrationEventPublisherImplement,
    },
    {
      provide: TASK_PUBLISHER,
      useClass: TaskPublisherImplement,
    },
  ],
  exports: [INTEGRATION_EVENT_PUBLISHER, TASK_PUBLISHER],
})
export class MessageModule {}
