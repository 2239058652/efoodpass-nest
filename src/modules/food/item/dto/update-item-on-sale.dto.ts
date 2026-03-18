import { Type } from 'class-transformer'
import { IsInt } from 'class-validator'

export class UpdateItemOnSaleDto {
    @Type(() => Number)
    @IsInt({ message: '菜品ID不能为空' })
    itemId: number

    @Type(() => Number)
    @IsInt({ message: '上下架状态不能为空' })
    isOnSale: number
}
