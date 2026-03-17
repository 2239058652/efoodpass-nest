import { IsNotEmpty, IsString } from 'class-validator'

export class LoginDto {
    /**
     * 用户名
     * @example admin
     */
    @IsString()
    @IsNotEmpty({ message: '用户名不能为空' })
    username: string

    /**
     * 密码
     * @example Admin@123
     */
    @IsString()
    @IsNotEmpty({ message: '密码不能为空' })
    password: string
}
