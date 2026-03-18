import { Type } from 'class-transformer'
import { IsInt, IsNotEmpty, IsOptional, IsString, Matches, Min } from 'class-validator'

export class UpdateItemDto {
    @Type(() => Number)
    @IsInt({ message: '菜品ID不能为空' })
    id: number

    @Type(() => Number)
    @IsInt({ message: '分类ID不能为空' })
    categoryId: number

    @IsString()
    @IsNotEmpty({ message: '菜品名称不能为空' })
    name: string

    @Matches(/^\d+(\.\d{1,2})?$/, { message: '价格格式不正确' })
    price: string

    @Type(() => Number)
    @IsInt({ message: '库存不能为空' })
    @Min(0, { message: '库存不能小于0' })
    stock: number

    @Type(() => Number)
    @IsInt({ message: '上下架状态不能为空' })
    isOnSale: number

    @IsOptional()
    @IsString()
    description?: string
}