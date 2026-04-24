import { Inject } from '@nestjs/common';

import {
  EntityIdTransformer,
  ENTITY_ID_TRANSFORMER,
  readConnection,
} from 'libs/DatabaseModule';

import { TaskQuery } from 'src/task/application/query/TaskQuery';
import { FindTaskByIdResult } from 'src/task/application/query/FindTaskByIdResult';
import { TaskEntity } from 'src/task/infrastructure/entity/TaskEntity';

export class TaskQueryImplement implements TaskQuery {
  @Inject(ENTITY_ID_TRANSFORMER)
  private readonly entityIdTransformer: EntityIdTransformer;

  async findById(id: string): Promise<FindTaskByIdResult | null> {
    const entity = await readConnection
      .getRepository(TaskEntity)
      .findOneBy({ id: this.entityIdTransformer.to(id) });

    if (!entity) return null;

    return {
      id: this.entityIdTransformer.from(entity.id),
      commandName: entity.commandName,
      status: entity.status,
      retryCount: entity.retryCount,
      errorMessage: entity.errorMessage,
      resultData: entity.resultData,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
