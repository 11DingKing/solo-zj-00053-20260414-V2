import { AggregateRoot } from '@nestjs/cqrs';

import { TaskStatus } from 'src/task/domain/TaskStatus';

export type TaskEssentialProperties = Readonly<
  Required<{
    id: string;
    commandName: string;
    commandData: string;
  }>
>;

export type TaskOptionalProperties = Readonly<
  Partial<{
    status: TaskStatus;
    retryCount: number;
    maxRetries: number;
    errorMessage: string | null;
    resultData: string | null;
    processedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }>
>;

export type TaskProperties = TaskEssentialProperties &
  Required<TaskOptionalProperties>;

export interface Task {
  getId: () => string;
  getStatus: () => TaskStatus;
  getRetryCount: () => number;
  getErrorMessage: () => string | null;
  getResultData: () => string | null;
  getCreatedAt: () => Date;
  startProcessing: () => void;
  retry: () => boolean;
  complete: (result?: string) => void;
  fail: (errorMessage: string) => void;
}

export class TaskImplement extends AggregateRoot implements Task {
  private readonly id: string;
  private readonly commandName: string;
  private readonly commandData: string;
  private status: TaskStatus;
  private retryCount: number;
  private readonly maxRetries: number;
  private errorMessage: string | null;
  private resultData: string | null;
  private processedAt: Date | null;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(properties: TaskProperties) {
    super();
    Object.assign(this, properties);
  }

  getId(): string {
    return this.id;
  }

  getStatus(): TaskStatus {
    return this.status;
  }

  getRetryCount(): number {
    return this.retryCount;
  }

  getErrorMessage(): string | null {
    return this.errorMessage;
  }

  getResultData(): string | null {
    return this.resultData;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  startProcessing(): void {
    this.status = TaskStatus.PROCESSING;
    this.updatedAt = new Date();
  }

  retry(): boolean {
    if (this.retryCount < this.maxRetries) {
      this.retryCount += 1;
      this.status = TaskStatus.RETRYING;
      this.updatedAt = new Date();
      return true;
    }
    return false;
  }

  complete(result?: string): void {
    this.status = TaskStatus.SUCCESS;
    this.resultData = result || null;
    this.processedAt = new Date();
    this.updatedAt = new Date();
  }

  fail(errorMessage: string): void {
    this.status = TaskStatus.FAILED;
    this.errorMessage = errorMessage;
    this.processedAt = new Date();
    this.updatedAt = new Date();
  }
}
