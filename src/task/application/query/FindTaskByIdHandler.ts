import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  AccountNotFoundError,
  ACCOUNT_NOT_FOUND_ERROR_MESSAGE,
} from 'libs/errors';

import { InjectionToken } from 'src/task/application/InjectionToken';
import { TaskQuery } from 'src/task/application/query/TaskQuery';
import { FindTaskByIdQuery } from 'src/task/application/query/FindTaskByIdQuery';
import { FindTaskByIdResult } from 'src/task/application/query/FindTaskByIdResult';

@QueryHandler(FindTaskByIdQuery)
export class FindTaskByIdHandler
  implements IQueryHandler<FindTaskByIdQuery, FindTaskByIdResult>
{
  @Inject(InjectionToken.TASK_QUERY) readonly taskQuery: TaskQuery;

  async execute(query: FindTaskByIdQuery): Promise<FindTaskByIdResult> {
    const data = await this.taskQuery.findById(query.id);
    if (!data) throw new AccountNotFoundError(ACCOUNT_NOT_FOUND_ERROR_MESSAGE);

    return data;
  }
}
