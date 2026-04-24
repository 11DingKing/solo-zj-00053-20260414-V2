import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TaskStatus } from 'src/task/domain/TaskStatus';

@Entity()
export class TaskEntity {
  @PrimaryColumn({ type: 'binary', length: 16 })
  id: Buffer;

  @Column()
  commandName: string;

  @Column({ type: 'text' })
  commandData: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'int', default: 3 })
  maxRetries: number;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'text', nullable: true })
  resultData: string | null;

  @Column({ type: 'datetime', precision: 6, nullable: true })
  processedAt: Date | null;

  @CreateDateColumn({ type: 'datetime', precision: 6 })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', precision: 6 })
  updatedAt: Date;
}
