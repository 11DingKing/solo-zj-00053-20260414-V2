import { Controller, Inject, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { MessageHandler } from 'libs/MessageModule';
import { BusinessError } from 'libs/errors/BusinessError';

import { LockAccountCommand } from 'src/account/application/command/LockAccountCommand';
import { RemitCommand } from 'src/account/application/command/RemitCommand';
import { WithdrawCommand } from 'src/account/application/command/WithdrawCommand';
import { DepositCommand } from 'src/account/application/command/DepositCommand';
import { CloseAccountCommand } from 'src/account/application/command/CloseAccountCommand';
import { UpdatePasswordCommand } from 'src/account/application/command/UpdatePasswordCommand';
import { OpenAccountCommand } from 'src/account/application/command/OpenAccountCommand';

@Controller()
export class AccountTaskController {
  private readonly logger = new Logger(AccountTaskController.name);

  @Inject() private readonly commandBus: CommandBus;

  @MessageHandler(LockAccountCommand.name)
  async lockAccount(message: LockAccountCommand): Promise<void> {
    await this.commandBus.execute<LockAccountCommand, void>(message);
  }

  @MessageHandler(RemitCommand.name)
  async remit(message: RemitCommand): Promise<void> {
    this.logger.log(`Processing remit command: ${JSON.stringify(message)}`);
    try {
      await this.commandBus.execute<RemitCommand, void>(message);
      this.logger.log(`Remit command completed successfully`);
    } catch (error) {
      if (error instanceof BusinessError) {
        this.logger.error(`Business error in remit command: ${error.message}`);
        throw error;
      }
      this.logger.error(
        `System error in remit command: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw error;
    }
  }

  @MessageHandler(WithdrawCommand.name)
  async withdraw(message: WithdrawCommand): Promise<void> {
    this.logger.log(`Processing withdraw command: ${JSON.stringify(message)}`);
    try {
      await this.commandBus.execute<WithdrawCommand, void>(message);
      this.logger.log(`Withdraw command completed successfully`);
    } catch (error) {
      if (error instanceof BusinessError) {
        this.logger.error(
          `Business error in withdraw command: ${error.message}`,
        );
        throw error;
      }
      this.logger.error(
        `System error in withdraw command: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw error;
    }
  }

  @MessageHandler(DepositCommand.name)
  async deposit(message: DepositCommand): Promise<void> {
    this.logger.log(`Processing deposit command: ${JSON.stringify(message)}`);
    try {
      await this.commandBus.execute<DepositCommand, void>(message);
      this.logger.log(`Deposit command completed successfully`);
    } catch (error) {
      if (error instanceof BusinessError) {
        this.logger.error(
          `Business error in deposit command: ${error.message}`,
        );
        throw error;
      }
      this.logger.error(
        `System error in deposit command: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw error;
    }
  }

  @MessageHandler(CloseAccountCommand.name)
  async closeAccount(message: CloseAccountCommand): Promise<void> {
    this.logger.log(
      `Processing closeAccount command: ${JSON.stringify(message)}`,
    );
    try {
      await this.commandBus.execute<CloseAccountCommand, void>(message);
      this.logger.log(`CloseAccount command completed successfully`);
    } catch (error) {
      if (error instanceof BusinessError) {
        this.logger.error(
          `Business error in closeAccount command: ${error.message}`,
        );
        throw error;
      }
      this.logger.error(
        `System error in closeAccount command: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw error;
    }
  }

  @MessageHandler(UpdatePasswordCommand.name)
  async updatePassword(message: UpdatePasswordCommand): Promise<void> {
    this.logger.log(
      `Processing updatePassword command: ${JSON.stringify(message)}`,
    );
    try {
      await this.commandBus.execute<UpdatePasswordCommand, void>(message);
      this.logger.log(`UpdatePassword command completed successfully`);
    } catch (error) {
      if (error instanceof BusinessError) {
        this.logger.error(
          `Business error in updatePassword command: ${error.message}`,
        );
        throw error;
      }
      this.logger.error(
        `System error in updatePassword command: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw error;
    }
  }

  @MessageHandler(OpenAccountCommand.name)
  async openAccount(message: OpenAccountCommand): Promise<void> {
    this.logger.log(
      `Processing openAccount command: ${JSON.stringify(message)}`,
    );
    try {
      await this.commandBus.execute<OpenAccountCommand, void>(message);
      this.logger.log(`OpenAccount command completed successfully`);
    } catch (error) {
      if (error instanceof BusinessError) {
        this.logger.error(
          `Business error in openAccount command: ${error.message}`,
        );
        throw error;
      }
      this.logger.error(
        `System error in openAccount command: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw error;
    }
  }
}
