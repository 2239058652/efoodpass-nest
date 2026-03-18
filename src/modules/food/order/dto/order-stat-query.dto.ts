import { IsDateString, IsOptional } from 'class-validator'

export class OrderStatQueryDto {
    @IsOptional()
    @IsDateString({}, { message: '开始日期格式不正确' })
    startDate?: string

    @IsOptional()
    @IsDateString({}, { message: '结束日期格式不正确' })
    endDate?: string
}
