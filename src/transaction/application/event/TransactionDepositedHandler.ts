import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { DepositedEvent } from 'src/account/domain/event/DepositedEvent';
import { TransactionType } from 'src/transaction/domain/TransactionType';
import { TransactionFactory } from 'src/transaction/domain/TransactionFactory';
import { TransactionRepository } from 'src/transaction/domain/TransactionRepository';
import { InjectionToken } from 'src/transaction/application/InjectionToken';

@EventsHandler(DepositedEvent)
export class TransactionDepositedHandler
  implements IEventHandler<DepositedEvent>
{
  @Inject(InjectionToken.TRANSACTION_REPOSITORY)
  private readonly transactionRepository: TransactionRepository;
  @Inject() private readonly transactionFactory: TransactionFactory;

  async handle(event: DepositedEvent): Promise<void> {
    const transactionId = await this.transactionRepository.newId();
    const transaction = this.transactionFactory.create({
      id: transactionId,
      accountId: event.accountId,
      type: TransactionType.DEPOSIT,
      amount: event.amount,
      balanceAfter: event.balanceAfter,
      counterpartyId: null,
      description: 'Deposit',
      createdAt: new Date(),
    });
    await this.transactionRepository.save(transaction);
  }
}
