import { Type } from 'class-transformer'
import { IsInt } from 'class-validator'

export class AdjustItemStockDto {
    @Type(() => Number)
    @IsInt({ message: '菜品ID不能为空' })
    itemId: number

    @Type(() => Number)
    @IsInt({ message: '调整数量不能为空' })
    deltaStock: number
}
