import { ArrayMinSize, IsArray, IsOptional, IsString } from 'class-validator'
import { Type } from 'class-transformer'
import { OrderItemDto } from './order-item.dto'

export class CreateOrderDto {
    @IsArray()
    @ArrayMinSize(1, { message: '订单项不能为空' })
    @Type(() => OrderItemDto)
    items: OrderItemDto[]

    @IsOptional()
    @IsString()
    remark?: string
}
