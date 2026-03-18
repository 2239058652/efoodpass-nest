import { Type } from 'class-transformer'
import { IsInt } from 'class-validator'

export class UpdateCategoryStatusDto {
    @Type(() => Number)
    @IsInt({ message: '分类ID不能为空' })
    categoryId: number

    @Type(() => Number)
    @IsInt({ message: '状态不能为空' })
    status: number
}
