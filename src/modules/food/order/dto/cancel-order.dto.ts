import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString } from 'class-validator'

export class CancelOrderDto {
    @Type(() => Number)
    @IsInt({ message: '订单ID不能为空' })
    orderId: number

    @IsOptional()
    @IsString()
    reason?: string
}
