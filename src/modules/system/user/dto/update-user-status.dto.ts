import { IsInt } from 'class-validator'

export class UpdateUserStatusDto {
    @IsInt({ message: '用户ID不能为空' })
    userId: number

    @IsInt({ message: '用户状态不能为空' })
    status: number
}
