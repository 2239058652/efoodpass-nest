import { IsInt, IsNotEmpty, IsOptional } from 'class-validator'

export class CreatePermissionDto {
    @IsNotEmpty({ message: '权限编码不能为空' })
    permCode: string

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
