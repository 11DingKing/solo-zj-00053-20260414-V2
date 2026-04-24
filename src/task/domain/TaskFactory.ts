import { Injectable } from '@nestjs/common';

import { Task, TaskImplement, TaskProperties } from 'src/task/domain/Task';
import { TaskStatus } from 'src/task/domain/TaskStatus';

@Injectable()
export class TaskFactory {
  create(
    properties: Partial<
      Omit<
        TaskProperties,
        'status' | 'retryCount' | 'createdAt' | 'updatedAt' | 'errorMessage' | 'resultData' | 'processedAt'
      >
    > & Pick<TaskProperties, 'id' | 'commandName' | 'commandData'>,
  ): Task {
    const now = new Date();
    return new TaskImplement({
      ...properties,
      status: TaskStatus.PENDING,
      retryCount: 0,
      maxRetries: properties.maxRetries ?? 3,
      errorMessage: null,
      resultData: null,
      processedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  reconstitute(properties: TaskProperties): Task {
    return new TaskImplement(properties);
  }
}
