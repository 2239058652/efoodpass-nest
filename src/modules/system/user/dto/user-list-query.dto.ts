import { Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, Min } from 'class-validator'

export class UserListQueryDto {
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
    username?: string

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    status?: number
}
