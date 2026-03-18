import { Type } from 'class-transformer'
import { ArrayMinSize, IsArray, IsInt, IsOptional, IsString } from 'class-validator'
import { OrderItemDto } from './order-item.dto'

export class CreateOrderDto {
    @Type(() => Number)
    @IsInt({ message: '下单用户ID不能为空' })
    userId: number

    @IsOptional()
    @IsString()
    remark?: string

    @IsArray()
    @ArrayMinSize(1, { message: '订单明细不能为空' })
    @Type(() => OrderItemDto)
    items: OrderItemDto[]
}
