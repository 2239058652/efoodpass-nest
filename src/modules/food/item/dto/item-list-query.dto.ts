import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, Min } from 'class-validator'

export class ItemListQueryDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageNum = 1

    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageSize = 10

    @IsOptional()
    @IsString()
    name?: string

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    categoryId?: number

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    isOnSale?: number
}
