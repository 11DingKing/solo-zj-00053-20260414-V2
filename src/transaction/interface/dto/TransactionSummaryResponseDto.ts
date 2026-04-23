import { ApiProperty } from '@nestjs/swagger';

export class TransactionSummaryResponseDto {
  @ApiProperty({ example: 1000 })
  readonly totalDeposit: number;

  @ApiProperty({ example: 500 })
  readonly totalWithdraw: number;

  @ApiProperty({ example: 200 })
  readonly totalRemitOut: number;

  @ApiProperty({ example: 300 })
  readonly totalRemitIn: number;

  @ApiProperty({ example: 600 })
  readonly netChange: number;
}
