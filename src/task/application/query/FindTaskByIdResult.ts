import { TaskStatus } from 'src/task/domain/TaskStatus';

export class FindTaskByIdResult {
  id: string;
  commandName: string;
  status: TaskStatus;
  retryCount: number;
  errorMessage: string | null;
  resultData: string | null;
  createdAt: Date;
  updatedAt: Date;
}
