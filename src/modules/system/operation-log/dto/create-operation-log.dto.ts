export class CreateOperationLogDto {
    userId?: number | null
    username?: string | null
    module: string
    operation: string
    requestMethod?: string | null
    requestUri?: string | null
    requestParams?: string | null
    responseData?: string | null
    ipAddress?: string | null
    status: number
    errorMessage?: string | null
}
