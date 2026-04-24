import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { BusinessError } from 'libs/errors/BusinessError';
import {
  ACCOUNT_NOT_FOUND_ERROR_CODE,
  INSUFFICIENT_BALANCE_ERROR_CODE,
  INVALID_AMOUNT_ERROR_CODE,
  SAME_ACCOUNT_ERROR_CODE,
  BALANCE_REMAINED_ERROR_CODE,
  ACCOUNT_LOCKED_ERROR_CODE,
  PASSWORD_SETTING_ERROR_CODE,
} from 'libs/errors';

const BUSINESS_ERROR_TO_HTTP_STATUS: Record<string, HttpStatus> = {
  [ACCOUNT_NOT_FOUND_ERROR_CODE]: HttpStatus.NOT_FOUND,
  [INSUFFICIENT_BALANCE_ERROR_CODE]: HttpStatus.UNPROCESSABLE_ENTITY,
  [INVALID_AMOUNT_ERROR_CODE]: HttpStatus.BAD_REQUEST,
  [SAME_ACCOUNT_ERROR_CODE]: HttpStatus.UNPROCESSABLE_ENTITY,
  [BALANCE_REMAINED_ERROR_CODE]: HttpStatus.UNPROCESSABLE_ENTITY,
  [ACCOUNT_LOCKED_ERROR_CODE]: HttpStatus.UNPROCESSABLE_ENTITY,
  [PASSWORD_SETTING_ERROR_CODE]: HttpStatus.UNPROCESSABLE_ENTITY,
};

interface ErrorResponse {
  code: string;
  message: string;
  timestamp: string;
}

const SYSTEM_ERROR_CODE = 'INTERNAL_SERVER_ERROR';
const SYSTEM_ERROR_MESSAGE = 'An unexpected error occurred';

@Catch()
export class HttpExceptionFilter
  implements ExceptionFilter<HttpException | BusinessError | Error>
{
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(
    exception: HttpException | BusinessError | Error,
    host: ArgumentsHost,
  ): Response<ErrorResponse, Record<string, string>> {
    const request = host.switchToHttp().getRequest<Request>();
    const response = host.switchToHttp().getResponse<Response>();
    const timestamp = new Date().toISOString();

    if (exception instanceof BusinessError) {
      this.logger.error(
        {
          errorType: 'BusinessError',
          code: exception.code,
          message: exception.message,
          request: {
            method: request.method,
            url: request.url,
            body: request.body,
          },
        },
        exception.stack,
      );

      const status =
        BUSINESS_ERROR_TO_HTTP_STATUS[exception.code] || HttpStatus.BAD_REQUEST;

      return response.status(status).json({
        code: exception.code,
        message: exception.message,
        timestamp,
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as { message?: string }).message ||
            exception.message;

      this.logger.error(
        {
          errorType: 'HttpException',
          status,
          message,
          request: {
            method: request.method,
            url: request.url,
            body: request.body,
          },
        },
        exception.stack,
      );

      if (
        status === 404 &&
        exception.message.split(' ')[0] === 'Cannot' &&
        exception.message.split(' ').length === 3
      ) {
        return response.status(HttpStatus.NOT_FOUND).json({
          code: 'NOT_FOUND',
          message: 'Resource not found',
          timestamp,
        });
      }

      return response.status(status).json({
        code: this.getHttpErrorCode(status),
        message,
        timestamp,
      });
    }

    this.logger.error(
      {
        errorType: 'SystemError',
        message: exception.message,
        request: {
          method: request.method,
          url: request.url,
          body: request.body,
        },
      },
      exception.stack,
    );

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      code: SYSTEM_ERROR_CODE,
      message: SYSTEM_ERROR_MESSAGE,
      timestamp,
    });
  }

  private getHttpErrorCode(status: number): string {
    if (status === HttpStatus.BAD_REQUEST) return 'BAD_REQUEST';
    if (status === HttpStatus.UNAUTHORIZED) return 'UNAUTHORIZED';
    if (status === HttpStatus.FORBIDDEN) return 'FORBIDDEN';
    if (status === HttpStatus.NOT_FOUND) return 'NOT_FOUND';
    if (status === HttpStatus.UNPROCESSABLE_ENTITY)
      return 'UNPROCESSABLE_ENTITY';
    if (status === HttpStatus.TOO_MANY_REQUESTS) return 'TOO_MANY_REQUESTS';
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) return SYSTEM_ERROR_CODE;
    return `HTTP_${status}`;
  }
}
