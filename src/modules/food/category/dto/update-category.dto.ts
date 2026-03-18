import { Type } from 'class-transformer'
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator'

export class UpdateCategoryDto {
    @Type(() => Number)
    @IsInt({ message: '分类ID不能为空' })
    id: number

    @IsNotEmpty({ message: '分类名称不能为空' })
    name: string

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    sortNo?: number

    @Type(() => Number)
    @IsInt({ message: '状态不能为空' })
    status: number
}
