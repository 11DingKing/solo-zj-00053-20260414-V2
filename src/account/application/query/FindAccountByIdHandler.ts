import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  AccountNotFoundError,
  ACCOUNT_NOT_FOUND_ERROR_MESSAGE,
} from 'libs/errors';

import { InjectionToken } from 'src/account/application/InjectionToken';
import { AccountQuery } from 'src/account/application/query/AccountQuery';
import { FindAccountByIdQuery } from 'src/account/application/query/FindAccountByIdQuery';
import { FindAccountByIdResult } from 'src/account/application/query/FindAccountByIdResult';

@QueryHandler(FindAccountByIdQuery)
export class FindAccountByIdHandler
  implements IQueryHandler<FindAccountByIdQuery, FindAccountByIdResult>
{
  @Inject(InjectionToken.ACCOUNT_QUERY) readonly accountQuery: AccountQuery;

  async execute(query: FindAccountByIdQuery): Promise<FindAccountByIdResult> {
    const data = await this.accountQuery.findById(query.id);
    if (!data) throw new AccountNotFoundError(ACCOUNT_NOT_FOUND_ERROR_MESSAGE);

    const dataKeys = Object.keys(data);
    const resultKeys = Object.keys(new FindAccountByIdResult());

    if (dataKeys.length < resultKeys.length)
      throw new Error('Data structure mismatch');

    if (resultKeys.find((resultKey) => !dataKeys.includes(resultKey)))
      throw new Error('Data structure mismatch');

    dataKeys
      .filter((dataKey) => !resultKeys.includes(dataKey))
      .forEach((dataKey) => delete data[dataKey]);

    return data;
  }
}
