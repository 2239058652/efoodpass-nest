import { IsInt, IsNotEmpty, IsOptional } from 'class-validator'

export class UpdatePermissionDto {
    @IsInt({ message: '权限ID不能为空' })
    id: number

    @IsNotEmpty({ message: '权限名称不能为空' })
    permName: string

    @IsInt({ message: '权限类型不能为空' })
    permType: number

    @IsOptional()
    path?: string

    @IsOptional()
    method?: string

    @IsInt({ message: '权限状态不能为空' })
    status: number
}
