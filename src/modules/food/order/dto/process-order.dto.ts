import { Type } from 'class-transformer'
import { IsInt } from 'class-validator'

export class ProcessOrderDto {
    @Type(() => Number)
    @IsInt({ message: '订单ID不能为空' })
    orderId: number
}
