import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator'
import { Type } from 'class-transformer'

export class AssignUserRoleDto {
    @IsInt({ message: '用户ID不能为空' })
    userId: number

    @IsArray()
    @ArrayNotEmpty({ message: '角色ID列表不能为空' })
    @Type(() => Number)
    @IsInt({ each: true })
    roleIds: number[]
}
