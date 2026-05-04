import {
  ExceptionFilter, Catch, ArgumentsHost,
  HttpException, HttpStatus, Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request  = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = isHttp
      ? exception.getResponse()
      : 'Error interno del servidor';

    // Log estructurado
    this.logger.error({
      statusCode: status,
      method:     request.method,
      url:        request.url,
      message:    typeof message === 'object' ? JSON.stringify(message) : message,
      stack:      exception instanceof Error ? exception.stack : undefined,
      timestamp:  new Date().toISOString(),
    });

    response.status(status).json({
      statusCode: status,
      message:    typeof message === 'object' && message !== null && 'message' in (message as Record<string, unknown>)
                  ? (message as Record<string, unknown>).message
                  : message,
      timestamp:  new Date().toISOString(),
      path:       request.url,
    });
  }
}