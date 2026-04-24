import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  Max,
  Min,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { TransactionType } from 'src/transaction/domain/TransactionType';

export class FindTransactionsRequestQueryString {
  @IsOptional()
  @IsEnum(TransactionType)
  @ApiProperty({ required: false, enum: TransactionType })
  readonly type?: TransactionType;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false, description: 'Start date in ISO format' })
  readonly startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false, description: 'End date in ISO format' })
  readonly endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @ApiProperty({ required: false, default: 0, minimum: 0 })
  readonly skip: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @ApiProperty({ required: false, default: 10, minimum: 1, maximum: 100 })
  readonly take: number = 10;
}
