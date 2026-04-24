import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Transactional } from 'libs/Transactional';
import {
  AccountNotFoundError,
  ACCOUNT_NOT_FOUND_ERROR_MESSAGE,
} from 'libs/errors';

import { WithdrawCommand } from 'src/account/application/command/WithdrawCommand';
import { InjectionToken } from 'src/account/application/InjectionToken';

import { AccountRepository } from 'src/account/domain/AccountRepository';

@CommandHandler(WithdrawCommand)
export class WithdrawHandler implements ICommandHandler<WithdrawCommand, void> {
  @Inject(InjectionToken.ACCOUNT_REPOSITORY)
  private readonly accountRepository: AccountRepository;

  @Transactional()
  async execute(command: WithdrawCommand): Promise<void> {
    const account = await this.accountRepository.findById(command.accountId);
    if (!account)
      throw new AccountNotFoundError(ACCOUNT_NOT_FOUND_ERROR_MESSAGE);

    account.withdraw(command.amount);

    await this.accountRepository.save(account);

    account.commit();
  }
}
