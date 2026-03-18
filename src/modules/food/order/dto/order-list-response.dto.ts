export class OrderListResponseDto {
    id: number
    orderNo: string
    userId: number
    totalAmount: string
    orderStatus: number
    remark: string | null
    createdAt: Date
}
