import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common'
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator'
import { AssignRolePermissionDto } from './dto/assign-role-permissions.dto'
import { CreateRoleDto } from './dto/create-role.dto'
import { RoleListQueryDto } from './dto/role-list-query.dto'
import { UpdateRoleStatusDto } from './dto/update-role-status.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { RoleService } from './role.service'
import { PermissionCode } from '../../../common/constants/permission.constants'

@Controller('system/role')
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Get('list')
    @RequirePermissions(PermissionCode.SYSTEM_ROLE_LIST)
    async list(@Query() query: RoleListQueryDto) {
        return this.roleService.listRoles(query)
    }

    @Post()
    @RequirePermissions(PermissionCode.SYSTEM_ROLE_ADD)
    async create(@Body() request: CreateRoleDto) {
        await this.roleService.createRole(request)
        return null
    }

    @Post('assign-permission')
    @RequirePermissions(PermissionCode.SYSTEM_ROLE_ASSIGN_PERMISSION)
    async assignPermission(@Body() request: AssignRolePermissionDto) {
        await this.roleService.assignPermissions(request)
        return null
    }

    @Put('status')
    @RequirePermissions(PermissionCode.SYSTEM_ROLE_UPDATE)
    async updateStatus(@Body() request: UpdateRoleStatusDto) {
        await this.roleService.updateRoleStatus(request)
        return null
    }

    @Delete(':id')
    @RequirePermissions(PermissionCode.SYSTEM_ROLE_DELETE)
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.roleService.deleteRole(id)
        return null
    }

    @Get(':id')
    @RequirePermissions(PermissionCode.SYSTEM_ROLE_LIST)
    async detail(@Param('id', ParseIntPipe) id: number) {
        return this.roleService.getRoleDetail(id)
    }

    @Put()
    @RequirePermissions(PermissionCode.SYSTEM_ROLE_UPDATE)
    async update(@Body() request: UpdateRoleDto) {
        await this.roleService.updateRole(request)
        return null
    }
}
