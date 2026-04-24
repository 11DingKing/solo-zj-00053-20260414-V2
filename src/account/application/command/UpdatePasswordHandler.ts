import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PasswordGenerator, PASSWORD_GENERATOR } from 'libs/PasswordModule';
import { Transactional } from 'libs/Transactional';
import {
  AccountNotFoundError,
  ACCOUNT_NOT_FOUND_ERROR_MESSAGE,
} from 'libs/errors';

import { UpdatePasswordCommand } from 'src/account/application/command/UpdatePasswordCommand';
import { InjectionToken } from 'src/account/application/InjectionToken';

import { AccountRepository } from 'src/account/domain/AccountRepository';

@CommandHandler(UpdatePasswordCommand)
export class UpdatePasswordHandler
  implements ICommandHandler<UpdatePasswordCommand, void>
{
  @Inject(InjectionToken.ACCOUNT_REPOSITORY)
  private readonly accountRepository: AccountRepository;
  @Inject(PASSWORD_GENERATOR)
  private readonly passwordGenerator: PasswordGenerator;

  @Transactional()
  async execute(command: UpdatePasswordCommand): Promise<void> {
    const account = await this.accountRepository.findById(command.accountId);
    if (!account)
      throw new AccountNotFoundError(ACCOUNT_NOT_FOUND_ERROR_MESSAGE);

    account.updatePassword(
      this.passwordGenerator.generateKey(command.password),
    );

    await this.accountRepository.save(account);

    account.commit();
  }
}
