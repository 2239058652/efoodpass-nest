import { Type } from 'class-transformer'
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator'

export class CreateCategoryDto {
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
