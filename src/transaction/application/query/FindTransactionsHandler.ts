import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { InjectionToken } from 'src/transaction/application/InjectionToken';
import { TransactionQuery } from 'src/transaction/application/query/TransactionQuery';
import { FindTransactionsQuery } from 'src/transaction/application/query/FindTransactionsQuery';
import { FindTransactionsResult } from 'src/transaction/application/query/FindTransactionsResult';

@QueryHandler(FindTransactionsQuery)
export class FindTransactionsHandler
  implements IQueryHandler<FindTransactionsQuery, FindTransactionsResult>
{
  @Inject(InjectionToken.TRANSACTION_QUERY) readonly transactionQuery: TransactionQuery;

  async execute(query: FindTransactionsQuery): Promise<FindTransactionsResult> {
    return this.transactionQuery.find(query);
  }
}
