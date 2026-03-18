import { Type } from 'class-transformer'
import { IsInt, IsOptional, Min } from 'class-validator'

export class OrderListQueryDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageNum = 1

    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageSize = 10

    @IsOptional()
    orderNo?: string

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    userId?: number

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    orderStatus?: number
}
