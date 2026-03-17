import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator'
import { Type } from 'class-transformer'

export class AssignRolePermissionDto {
    @IsInt({ message: '角色ID不能为空' })
    roleId: number

    @IsArray()
    @ArrayNotEmpty({ message: '权限ID列表不能为空' })
    @Type(() => Number)
    @IsInt({ each: true })
    permissionIds: number[]
}
