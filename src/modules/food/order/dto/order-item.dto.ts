import { Type } from 'class-transformer'
import { IsInt, Min } from 'class-validator'

export class OrderItemDto {
    @Type(() => Number)
    @IsInt({ message: '菜品ID不能为空' })
    foodItemId: number

    @Type(() => Number)
    @IsInt({ message: '数量不能为空' })
    @Min(1, { message: '数量必须大于0' })
    quantity: number
}
