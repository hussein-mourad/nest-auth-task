import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

interface HttpErrorBody {
  message?: string | string[];
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = this.extractMessage(exception.getResponse());
    } else if (this.isDuplicateKeyError(exception)) {
      status = HttpStatus.CONFLICT;
      message = 'Email is already registered';
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  private extractMessage(body: string | object): string {
    if (typeof body === 'string') {
      return body;
    }

    const message = (body as HttpErrorBody).message;
    if (Array.isArray(message)) {
      return message.join(', ');
    }

    return message ?? 'Request failed';
  }

  private isDuplicateKeyError(exception: unknown): boolean {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      (exception as { code?: unknown }).code === 11000
    );
  }
}
