import { Inject } from '@nestjs/common';

import {
  EntityIdTransformer,
  ENTITY_ID_TRANSFORMER,
  readConnection,
  writeConnection,
} from 'libs/DatabaseModule';

import { Task } from 'src/task/domain/Task';
import { TaskRepository } from 'src/task/domain/TaskRepository';
import { TaskFactory } from 'src/task/domain/TaskFactory';
import { TaskEntity } from 'src/task/infrastructure/entity/TaskEntity';

export class TaskRepositoryImplement implements TaskRepository {
  @Inject(ENTITY_ID_TRANSFORMER)
  private readonly entityIdTransformer: EntityIdTransformer;
  @Inject() private readonly taskFactory: TaskFactory;

  async newId(): Promise<string> {
    return [...Array(32)]
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');
  }

  async save(task: Task | Task[]): Promise<void> {
    const tasks = Array.isArray(task) ? task : [task];
    const entities = tasks.map((t) => this.modelToEntity(t));
    await writeConnection.manager.save(entities);
  }

  async findById(id: string): Promise<Task | null> {
    const entity = await readConnection
      .getRepository(TaskEntity)
      .findOneBy({ id: this.entityIdTransformer.to(id) });
    return entity ? this.entityToModel(entity) : null;
  }

  private modelToEntity(model: Task): TaskEntity {
    const entity = new TaskEntity();
    const properties = JSON.parse(JSON.stringify(model)) as TaskEntity;
    Object.assign(entity, {
      ...properties,
      id: this.entityIdTransformer.to(model.getId()),
    });
    return entity;
  }

  private entityToModel(entity: TaskEntity): Task {
    return this.taskFactory.reconstitute({
      id: this.entityIdTransformer.from(entity.id),
      commandName: entity.commandName,
      commandData: entity.commandData,
      status: entity.status,
      retryCount: entity.retryCount,
      maxRetries: entity.maxRetries,
      errorMessage: entity.errorMessage,
      resultData: entity.resultData,
      processedAt: entity.processedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
