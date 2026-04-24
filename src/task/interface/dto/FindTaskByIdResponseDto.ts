import { ApiProperty } from '@nestjs/swagger';

import { TaskStatus } from 'src/task/domain/TaskStatus';

export class FindTaskByIdResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  commandName: string;

  @ApiProperty({ enum: TaskStatus })
  status: TaskStatus;

  @ApiProperty()
  retryCount: number;

  @ApiProperty({ nullable: true })
  errorMessage: string | null;

  @ApiProperty({ nullable: true })
  resultData: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
