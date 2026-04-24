import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class FindTaskByIdRequestParam {
  @ApiProperty()
  @IsUUID()
  readonly taskId: string;
}
