export class OperationLogListResponseDto {
    id: number
    userId: number | null
    username: string | null
    module: string
    operation: string
    requestMethod: string | null
    requestUri: string | null
    ipAddress: string | null
    status: number
    errorMessage: string | null
    createdAt: Date
}
