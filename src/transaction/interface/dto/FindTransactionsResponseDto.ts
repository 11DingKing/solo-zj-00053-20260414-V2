import { ApiProperty } from '@nestjs/swagger';

import { EntityId } from 'libs/DatabaseModule';

import { FindTransactionsResult } from 'src/transaction/application/query/FindTransactionsResult';
import { TransactionType } from 'src/transaction/domain/TransactionType';

class Transaction {
  @ApiProperty({ example: new EntityId() })
  readonly id: string;

  @ApiProperty({ example: new EntityId() })
  readonly accountId: string;

  @ApiProperty({ enum: TransactionType })
  readonly type: TransactionType;

  @ApiProperty({ example: 100 })
  readonly amount: number;

  @ApiProperty({ example: 500 })
  readonly balanceAfter: number;

  @ApiProperty({ example: new EntityId(), nullable: true })
  readonly counterpartyId: string | null;

  @ApiProperty({ example: 'Deposit', nullable: true })
  readonly description: string | null;

  @ApiProperty({ example: new Date() })
  readonly createdAt: Date;
}

export class FindTransactionsResponseDto extends FindTransactionsResult {
  @ApiProperty({ type: [Transaction] })
  readonly transactions: Transaction[];

  @ApiProperty({ example: 100 })
  readonly total: number;
}
