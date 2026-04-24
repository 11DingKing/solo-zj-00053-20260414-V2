import { FindTransactionsQuery } from 'src/transaction/application/query/FindTransactionsQuery';
import { FindTransactionsResult } from 'src/transaction/application/query/FindTransactionsResult';

export interface TransactionQuery {
  find: (query: FindTransactionsQuery) => Promise<FindTransactionsResult>;
  getSummary: (
    accountId: string,
    startDate?: Date,
    endDate?: Date,
  ) => Promise<{
    totalDeposit: number;
    totalWithdraw: number;
    totalRemitOut: number;
    totalRemitIn: number;
    netChange: number;
  }>;
}
