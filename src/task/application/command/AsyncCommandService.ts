import { Inject, Injectable } from '@nestjs/common';
import { ICommand } from '@nestjs/cqrs';

import { TaskPublisher, TASK_PUBLISHER } from 'libs/MessageModule';

import { InjectionToken } from 'src/task/application/InjectionToken';
import { TaskRepository } from 'src/task/domain/TaskRepository';
import { TaskFactory } from 'src/task/domain/TaskFactory';
import { TaskStatus } from 'src/task/domain/TaskStatus';

@Injectable()
export class AsyncCommandService {
  @Inject(TASK_PUBLISHER)
  private readonly taskPublisher: TaskPublisher;
  @Inject(InjectionToken.TASK_REPOSITORY)
  private readonly taskRepository: TaskRepository;
  @Inject() private readonly taskFactory: TaskFactory;

  async executeAsync<T extends ICommand>(
    command: T,
    maxRetries = 3,
  ): Promise<{ taskId: string; status: string; pollingUrl: string }> {
    const taskId = await this.taskRepository.newId();
    const commandName = command.constructor.name;
    const commandData = JSON.stringify(command);

    const task = this.taskFactory.create({
      id: taskId,
      commandName,
      commandData,
      maxRetries,
    });

    await this.taskRepository.save(task);

    await this.taskPublisher.publish(commandName, command, taskId, maxRetries);

    return {
      taskId,
      status: TaskStatus.PENDING,
      pollingUrl: `/tasks/${taskId}`,
    };
  }
}
