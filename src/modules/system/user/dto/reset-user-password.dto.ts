import { IsInt, IsNotEmpty } from 'class-validator'

export class ResetUserPasswordDto {
    @IsInt({ message: '用户ID不能为空' })
    userId: number

    @IsNotEmpty({ message: '新密码不能为空' })
    newPassword: string
}
