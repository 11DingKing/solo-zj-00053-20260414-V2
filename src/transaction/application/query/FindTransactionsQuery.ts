import { IQuery } from '@nestjs/cqrs';
import { TransactionType } from 'src/transaction/domain/TransactionType';

export class FindTransactionsQuery implements IQuery {
  readonly accountId: string;
  readonly type?: TransactionType;
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly skip: number;
  readonly take: number;

  constructor(options: FindTransactionsQuery) {
    Object.assign(this, options);
  }
}
