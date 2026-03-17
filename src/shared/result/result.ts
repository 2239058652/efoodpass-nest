export class Result<T = unknown> {
    constructor(
        public readonly code: number,
        public readonly message: string,
        public readonly data: T | null,
    ) {}

    static ok<T>(data: T, message = 'success', code = 200): Result<T> {
        return new Result(code, message, data)
    }

    static fail<T = null>(code: number, message: string, data: T | null = null): Result<T> {
        return new Result(code, message, data)
    }
}
