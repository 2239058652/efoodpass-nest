import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common'
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator'
import { AssignRolePermissionDto } from './dto/assign-role-permissions.dto'
import { CreateRoleDto } from './dto/create-role.dto'
import { RoleListQueryDto } from './dto/role-list-query.dto'
import { UpdateRoleStatusDto } from './dto/update-role-status.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { RoleService } from './role.service'

@Controller('system/role')
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Get('list')
    @RequirePermissions('system:role:list')
    async list(@Query() query: RoleListQueryDto) {
        return this.roleService.listRoles(query)
    }

    @Post()
    @RequirePermissions('system:role:add')
    async create(@Body() request: CreateRoleDto) {
        await this.roleService.createRole(request)
        return null
    }

    @Post('assign-permission')
    @RequirePermissions('system:role:assign-permission')
    async assignPermission(@Body() request: AssignRolePermissionDto) {
        await this.roleService.assignPermissions(request)
        return null
    }

    @Put('status')
    @RequirePermissions('system:role:update')
    async updateStatus(@Body() request: UpdateRoleStatusDto) {
        await this.roleService.updateRoleStatus(request)
        return null
    }

    @Delete(':id')
    @RequirePermissions('system:role:delete')
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.roleService.deleteRole(id)
        return null
    }

    @Get(':id')
    @RequirePermissions('system:role:list')
    async detail(@Param('id', ParseIntPipe) id: number) {
        return this.roleService.getRoleDetail(id)
    }

    @Put()
    @RequirePermissions('system:role:update')
    async update(@Body() request: UpdateRoleDto) {
        await this.roleService.updateRole(request)
        return null
    }
}
