import { IsInt, IsNotEmpty } from 'class-validator'

export class CreateRoleDto {
    @IsNotEmpty({ message: '角色编码不能为空' })
    roleCode: string

    @IsNotEmpty({ message: '角色名称不能为空' })
    roleName: string

    @IsInt({ message: '角色状态不能为空' })
    status: number
}
