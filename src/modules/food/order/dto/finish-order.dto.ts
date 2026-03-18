import { Type } from 'class-transformer'
import { IsInt } from 'class-validator'

export class FinishOrderDto {
    @Type(() => Number)
    @IsInt({ message: '订单ID不能为空' })
    orderId: number
}
