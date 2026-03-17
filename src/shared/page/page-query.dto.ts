import { Transform } from 'class-transformer'
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

export class PageQueryDto {
    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(1)
    pageNum = 1

    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(1)
    @Max(100)
    pageSize = 10

    @IsOptional()
    @IsString()
    sortBy?: string

    @IsOptional()
    @IsIn(['ASC', 'DESC', 'asc', 'desc'])
    sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc'
}