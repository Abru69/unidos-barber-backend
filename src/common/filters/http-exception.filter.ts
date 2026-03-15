import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse();
    const status   = exception.getStatus();
    const res      = exception.getResponse() as any;

    response.status(status).json({
      code:    status,
      message: Array.isArray(res.message) ? res.message[0] : res.message || exception.message,
      data:    null,
    });
  }
}
