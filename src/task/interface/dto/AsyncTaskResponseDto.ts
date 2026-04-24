import { ApiProperty } from '@nestjs/swagger';

export class AsyncTaskResponseDto {
  @ApiProperty()
  taskId: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  pollingUrl: string;
}
