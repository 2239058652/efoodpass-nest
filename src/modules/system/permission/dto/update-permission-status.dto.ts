import { IsInt } from 'class-validator'

export class UpdatePermissionStatusDto {
    @IsInt({ message: '权限ID不能为空' })
    permissionId: number

    @IsInt({ message: '权限状态不能为空' })
    status: number
}
