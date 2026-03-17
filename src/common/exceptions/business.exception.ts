import { HttpException, HttpStatus } from '@nestjs/common'

export class BusinessException<T = unknown> extends HttpException {
    constructor(
        public readonly code: number,
        message: string,
        public readonly data: T | null = null,
        status = HttpStatus.BAD_REQUEST,
    ) {
        super(
            {
                code,
                message,
                data,
            },
            status,
        )
    }
}
