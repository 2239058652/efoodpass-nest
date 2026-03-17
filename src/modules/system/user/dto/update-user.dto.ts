import { IsInt, IsNotEmpty, IsOptional } from 'class-validator'

export class UpdateUserDto {
    @IsInt({ message: '用户ID不能为空' })
    id: number

    @IsNotEmpty({ message: '昵称不能为空' })
    nickname: string

    @IsOptional()
    phone?: string

    @IsInt({ message: '状态不能为空' })
    status: number
}
