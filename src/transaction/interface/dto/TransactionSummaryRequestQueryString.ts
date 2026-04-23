import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsDateString } from 'class-validator';

export class TransactionSummaryRequestQueryString {
  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false, description: 'Start date in ISO format' })
  readonly startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false, description: 'End date in ISO format' })
  readonly endDate?: string;
}
