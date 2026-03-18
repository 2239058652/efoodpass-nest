export class OrderOverviewResponseDto {
    totalOrderCount: number
    pendingCount: number
    processingCount: number
    completedCount: number
    canceledCount: number
    totalAmount: string
}
