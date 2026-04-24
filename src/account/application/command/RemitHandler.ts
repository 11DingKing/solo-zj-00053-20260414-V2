import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Transactional } from 'libs/Transactional';
import {
  AccountNotFoundError,
  SameAccountError,
  ACCOUNT_NOT_FOUND_ERROR_MESSAGE,
  SAME_ACCOUNT_ERROR_MESSAGE,
} from 'libs/errors';

import { RemitCommand } from 'src/account/application/command/RemitCommand';
import { InjectionToken } from 'src/account/application/InjectionToken';

import { AccountRepository } from 'src/account/domain/AccountRepository';
import { AccountDomainService } from 'src/account/domain/AccountDomainService';

@CommandHandler(RemitCommand)
export class RemitHandler implements ICommandHandler<RemitCommand, void> {
  @Inject(InjectionToken.ACCOUNT_REPOSITORY)
  private readonly accountRepository: AccountRepository;
  @Inject() private readonly accountDomainService: AccountDomainService;

  @Transactional()
  async execute(command: RemitCommand): Promise<void> {
    if (command.accountId === command.receiverId)
      throw new SameAccountError(SAME_ACCOUNT_ERROR_MESSAGE);

    const account = await this.accountRepository.findById(command.accountId);
    if (!account)
      throw new AccountNotFoundError(ACCOUNT_NOT_FOUND_ERROR_MESSAGE);

    const receiver = await this.accountRepository.findById(command.receiverId);
    if (!receiver)
      throw new AccountNotFoundError(ACCOUNT_NOT_FOUND_ERROR_MESSAGE);

    this.accountDomainService.remit({ ...command, account, receiver });

    await this.accountRepository.save([account, receiver]);

    account.commit();
    receiver.commit();
  }
}
