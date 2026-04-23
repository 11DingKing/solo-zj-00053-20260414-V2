import { Entity, Column, PrimaryColumn } from 'typeorm';

import { BaseEntity } from 'src/account/infrastructure/entity/BaseEntity';
import { TransactionType } from 'src/transaction/domain/TransactionType';

@Entity()
export class TransactionEntity extends BaseEntity {
  @PrimaryColumn({ type: 'binary', length: 16 })
  id: Buffer;

  @Column({ type: 'binary', length: 16 })
  accountId: Buffer;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column()
  amount: number;

  @Column()
  balanceAfter: number;

  @Column({ type: 'binary', length: 16, nullable: true })
  counterpartyId: Buffer | null;

  @Column({ nullable: true })
  description: string | null;
}
