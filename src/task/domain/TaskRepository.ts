import { Task } from 'src/task/domain/Task';

export interface TaskRepository {
  newId: () => Promise<string>;
  save: (task: Task | Task[]) => Promise<void>;
  findById: (id: string) => Promise<Task | null>;
}
