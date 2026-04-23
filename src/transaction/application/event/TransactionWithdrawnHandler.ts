import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { WithdrawnEvent } from 'src/account/domain/event/WithdrawnEvent';
import { TransactionType } from 'src/transaction/domain/TransactionType';
import { TransactionFactory } from 'src/transaction/domain/TransactionFactory';
import { TransactionRepository } from 'src/transaction/domain/TransactionRepository';
import { InjectionToken } from 'src/transaction/application/InjectionToken';

@EventsHandler(WithdrawnEvent)
export class TransactionWithdrawnHandler implements IEventHandler<WithdrawnEvent> {
  @Inject(InjectionToken.TRANSACTION_REPOSITORY)
  private readonly transactionRepository: TransactionRepository;
  @Inject() private readonly transactionFactory: TransactionFactory;

  async handle(event: WithdrawnEvent): Promise<void> {
    const transactionId = await this.transactionRepository.newId();
    const transaction = this.transactionFactory.create({
      id: transactionId,
      accountId: event.accountId,
      type: TransactionType.WITHDRAW,
      amount: event.amount,
      balanceAfter: event.balanceAfter,
      counterpartyId: null,
      description: 'Withdraw',
      createdAt: new Date(),
    });
    await this.transactionRepository.save(transaction);
  }
}
