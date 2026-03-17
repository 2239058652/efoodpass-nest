import { IsInt, IsNotEmpty, IsOptional } from 'class-validator'

export class CreateUserDto {
    @IsNotEmpty({ message: '用户名不能为空' })
    username: string

    @IsNotEmpty({ message: '密码不能为空' })
    password: string

    @IsNotEmpty({ message: '昵称不能为空' })
    nickname: string

    @IsOptional()
    phone?: string

    @IsInt({ message: '状态不能为空' })
    status: number
}
