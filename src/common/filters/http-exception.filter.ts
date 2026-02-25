import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface NestErrorResponse {
    message: string | string[];
    error: string;
    statusCode: number;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger('ExceptionFilter');

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const exceptionResponse =
            exception instanceof HttpException
                ? (exception.getResponse() as string | NestErrorResponse)
                : 'Internal server error';

        const message =
            typeof exceptionResponse === 'object'
                ? exceptionResponse.message
                : exceptionResponse;

        this.logger.error(
            `[${request.method}] ${request.url} - Status: ${status} - Message: ${JSON.stringify(message)}`,
        );

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: Array.isArray(message) ? message[0] : message, // Tomamos el primer error si es array
        });
    }
}
