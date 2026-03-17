import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Result } from '../../shared/result/result'

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Result<T | null>> {
    intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<Result<T | null>> {
        return next.handle().pipe(
            map((data) => {
                if (data instanceof Result) {
                    return data
                }

                return Result.ok(data ?? null)
            }),
        )
    }
}
