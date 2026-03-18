export class ItemDetailResponseDto {
    id: number
    categoryId: number
    categoryName: string
    name: string
    price: string
    stock: number
    isOnSale: number
    description: string | null
    createdAt: Date
    updatedAt: Date
}
