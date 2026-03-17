import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    ForbiddenException,
    HttpException,
    HttpStatus,
    Logger,
    UnauthorizedException,
} from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { QueryFailedError } from 'typeorm'
import { BizErrorCode } from '../constants/biz-error-code'
import { BusinessException } from '../exceptions/business.exception'
import { Result } from '../../shared/result/result'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name)

    constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost
        const ctx = host.switchToHttp()

        const request = ctx.getRequest<Request>()
        const responseBody = this.buildResponse(exception)

        if (!(exception instanceof BusinessException)) {
            this.logger.error(
                `${(request as any)?.method ?? 'UNKNOWN'} ${(request as any)?.url ?? 'UNKNOWN'}`,
                exception instanceof Error ? exception.stack : String(exception),
            )
        }

        httpAdapter.reply(ctx.getResponse(), responseBody.body, responseBody.status)
    }

    private buildResponse(exception: unknown): {
        status: number
        body: Result<unknown>
    } {
        if (exception instanceof BusinessException) {
            return {
                status: exception.getStatus(),
                body: Result.fail(exception.code, exception.message, exception.data),
            }
        }

        if (exception instanceof UnauthorizedException) {
            return {
                status: HttpStatus.UNAUTHORIZED,
                body: Result.fail(BizErrorCode.UNAUTHORIZED, '未认证或 token 无效'),
            }
        }

        if (exception instanceof ForbiddenException) {
            return {
                status: HttpStatus.FORBIDDEN,
                body: Result.fail(BizErrorCode.FORBIDDEN, '无权限访问'),
            }
        }

        if (exception instanceof HttpException) {
            const status = exception.getStatus()
            const exceptionResponse = exception.getResponse()

            if (status === HttpStatus.BAD_REQUEST) {
                const message = this.extractValidationMessage(exceptionResponse)
                return {
                    status,
                    body: Result.fail(BizErrorCode.VALIDATION_ERROR, message),
                }
            }

            return {
                status,
                body: Result.fail(BizErrorCode.COMMON_ERROR, this.extractHttpMessage(exceptionResponse)),
            }
        }

        if (exception instanceof QueryFailedError) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                body: Result.fail(BizErrorCode.COMMON_ERROR, '数据库执行异常'),
            }
        }

        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            body: Result.fail(BizErrorCode.COMMON_ERROR, '系统繁忙，请稍后重试'),
        }
    }

    private extractValidationMessage(exceptionResponse: unknown): string {
        if (typeof exceptionResponse === 'object' && exceptionResponse !== null && 'message' in exceptionResponse) {
            const message = (exceptionResponse as { message: string | string[] }).message
            if (Array.isArray(message)) {
                return message.join('; ')
            }
            return message
        }

        return '请求参数校验失败'
    }

    private extractHttpMessage(exceptionResponse: unknown): string {
        if (typeof exceptionResponse === 'string') {
            return exceptionResponse
        }

        if (typeof exceptionResponse === 'object' && exceptionResponse !== null && 'message' in exceptionResponse) {
            const message = (exceptionResponse as { message: string | string[] }).message
            if (Array.isArray(message)) {
                return message.join('; ')
            }
            return message
        }

        return '请求处理失败'
    }
}