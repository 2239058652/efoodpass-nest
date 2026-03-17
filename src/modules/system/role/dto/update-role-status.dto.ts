import { IsInt } from 'class-validator'

export class UpdateRoleStatusDto {
    @IsInt({ message: '角色ID不能为空' })
    roleId: number

    @IsInt({ message: '角色状态不能为空' })
    status: number
}
