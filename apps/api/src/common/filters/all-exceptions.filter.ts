import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Catches every unhandled error and returns the standard ApiResponse envelope.
 * Prevents leaking stack traces in production and guarantees a consistent shape.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload =
      exception instanceof HttpException ? exception.getResponse() : 'Internal server error';

    const message =
      typeof payload === 'string'
        ? payload
        : ((payload as Record<string, unknown>).message ?? 'Unexpected error');

    if (status >= 500) {
      this.logger.error(`${request.method} ${request.url}`, (exception as Error)?.stack);
      // TODO: Sentry.captureException(exception)
    }

    response.status(status).json({
      success: false,
      error: {
        code: (exception as { code?: string })?.code ?? `HTTP_${status}`,
        message,
      },
      meta: { path: request.url, timestamp: new Date().toISOString() },
    });
  }
}
