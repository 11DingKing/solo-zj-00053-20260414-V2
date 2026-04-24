import { FindTaskByIdResult } from 'src/task/application/query/FindTaskByIdResult';

export interface TaskQuery {
  findById: (id: string) => Promise<FindTaskByIdResult | null>;
}
