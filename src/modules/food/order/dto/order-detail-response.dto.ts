export class OrderDetailItemResponseDto {
    id: number
    foodItemId: number
    foodNameSnapshot: string
    priceSnapshot: string
    quantity: number
    amount: string
}

export class OrderDetailResponseDto {
    id: number
    orderNo: string
    userId: number
    totalAmount: string
    orderStatus: number
    remark: string | null
    createdAt: Date
    updatedAt: Date
    items: OrderDetailItemResponseDto[]
}
