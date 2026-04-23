import { IQueryResult } from '@nestjs/cqrs';
import { TransactionType } from 'src/transaction/domain/TransactionType';

export class FindTransactionsResult implements IQueryResult {
  constructor(
    readonly transactions: Readonly<{
      id: string;
      accountId: string;
      type: TransactionType;
      amount: number;
      balanceAfter: number;
      counterpartyId: string | null;
      description: string | null;
      createdAt: Date;
    }>[],
    readonly total: number,
  ) {}
}
