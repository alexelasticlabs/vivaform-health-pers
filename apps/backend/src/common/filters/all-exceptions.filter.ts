﻿import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: any = ctx.getResponse();
    const request: any = ctx.getRequest();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException ? exception.message : 'Internal server error';
    const path = request?.originalUrl || request?.url;

    // Minimal JSON error envelope
    const body = {
      statusCode: status,
      error: HttpStatus[status] || 'Error',
      message,
      path,
      timestamp: new Date().toISOString()
    };

    // Log error with stack if available
    if (exception instanceof Error) {
      this.logger.error(`${status} ${message} - ${path}`, exception.stack);
    } else {
      this.logger.error(`${status} ${message} - ${path}`);
    }

    response.status(status).json(body);
  }
}

