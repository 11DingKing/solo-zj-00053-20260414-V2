import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { InjectionToken } from 'src/task/application/InjectionToken';
import { AsyncCommandService } from 'src/task/application/command/AsyncCommandService';
import { FindTaskByIdHandler } from 'src/task/application/query/FindTaskByIdHandler';
import { TaskFactory } from 'src/task/domain/TaskFactory';
import { TaskQueryImplement } from 'src/task/infrastructure/query/TaskQueryImplement';
import { TaskRepositoryImplement } from 'src/task/infrastructure/repository/TaskRepositoryImplement';
import { TasksController } from 'src/task/interface/TasksController';

const infrastructure: Provider[] = [
  {
    provide: InjectionToken.TASK_REPOSITORY,
    useClass: TaskRepositoryImplement,
  },
  {
    provide: InjectionToken.TASK_QUERY,
    useClass: TaskQueryImplement,
  },
];

const application: Provider[] = [AsyncCommandService, FindTaskByIdHandler];

const domain: Provider[] = [TaskFactory];

@Module({
  imports: [CqrsModule],
  controllers: [TasksController],
  providers: [...infrastructure, ...application, ...domain],
  exports: [InjectionToken.TASK_REPOSITORY, TaskFactory, AsyncCommandService],
})
export class TasksModule {}
