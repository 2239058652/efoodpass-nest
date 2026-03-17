import { IsInt, IsNotEmpty } from 'class-validator'

export class UpdateRoleDto {
    @IsInt({ message: '角色ID不能为空' })
    id: number

    @IsNotEmpty({ message: '角色名称不能为空' })
    roleName: string

    @IsInt({ message: '角色状态不能为空' })
    status: number
}
