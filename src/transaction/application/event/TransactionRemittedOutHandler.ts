import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { RemittedOutEvent } from 'src/account/domain/event/RemittedOutEvent';
import { TransactionType } from 'src/transaction/domain/TransactionType';
import { TransactionFactory } from 'src/transaction/domain/TransactionFactory';
import { TransactionRepository } from 'src/transaction/domain/TransactionRepository';
import { InjectionToken } from 'src/transaction/application/InjectionToken';

@EventsHandler(RemittedOutEvent)
export class TransactionRemittedOutHandler
  implements IEventHandler<RemittedOutEvent>
{
  @Inject(InjectionToken.TRANSACTION_REPOSITORY)
  private readonly transactionRepository: TransactionRepository;
  @Inject() private readonly transactionFactory: TransactionFactory;

  async handle(event: RemittedOutEvent): Promise<void> {
    const transactionId = await this.transactionRepository.newId();
    const transaction = this.transactionFactory.create({
      id: transactionId,
      accountId: event.accountId,
      type: TransactionType.REMIT_OUT,
      amount: event.amount,
      balanceAfter: event.balanceAfter,
      counterpartyId: event.receiverId,
      description: 'Remit to ' + event.receiverId,
      createdAt: new Date(),
    });
    await this.transactionRepository.save(transaction);
  }
}
