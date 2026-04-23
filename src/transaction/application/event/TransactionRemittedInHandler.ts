import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { RemittedInEvent } from 'src/account/domain/event/RemittedInEvent';
import { TransactionType } from 'src/transaction/domain/TransactionType';
import { TransactionFactory } from 'src/transaction/domain/TransactionFactory';
import { TransactionRepository } from 'src/transaction/domain/TransactionRepository';
import { InjectionToken } from 'src/transaction/application/InjectionToken';

@EventsHandler(RemittedInEvent)
export class TransactionRemittedInHandler implements IEventHandler<RemittedInEvent> {
  @Inject(InjectionToken.TRANSACTION_REPOSITORY)
  private readonly transactionRepository: TransactionRepository;
  @Inject() private readonly transactionFactory: TransactionFactory;

  async handle(event: RemittedInEvent): Promise<void> {
    const transactionId = await this.transactionRepository.newId();
    const transaction = this.transactionFactory.create({
      id: transactionId,
      accountId: event.accountId,
      type: TransactionType.REMIT_IN,
      amount: event.amount,
      balanceAfter: event.balanceAfter,
      counterpartyId: event.senderId,
      description: 'Remit from ' + event.senderId,
      createdAt: new Date(),
    });
    await this.transactionRepository.save(transaction);
  }
}
