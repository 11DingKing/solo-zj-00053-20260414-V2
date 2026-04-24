import { Controller, Get, Param, HttpStatus } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';

import { FindTaskByIdQuery } from 'src/task/application/query/FindTaskByIdQuery';
import { FindTaskByIdRequestParam } from 'src/task/interface/dto/FindTaskByIdRequestParam';
import { FindTaskByIdResponseDto } from 'src/task/interface/dto/FindTaskByIdResponseDto';

@ApiTags('Tasks')
@Controller()
export class TasksController {
  constructor(readonly queryBus: QueryBus) {}

  @Get('tasks/:taskId')
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Task retrieved successfully',
    type: FindTaskByIdResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async findTaskById(
    @Param() param: FindTaskByIdRequestParam,
  ): Promise<FindTaskByIdResponseDto> {
    return this.queryBus.execute(new FindTaskByIdQuery(param.taskId));
  }
}
