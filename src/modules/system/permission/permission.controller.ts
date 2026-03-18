import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common'
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator'
import { CreatePermissionDto } from './dto/create-permission.dto'
import { PermissionListQueryDto } from './dto/permission-list-query.dto'
import { UpdatePermissionStatusDto } from './dto/update-permission-status.dto'
import { UpdatePermissionDto } from './dto/update-permission.dto'
import { PermissionService } from './permission.service'
import { PermissionCode } from '../../../common/constants/permission.constants'

@Controller('system/permission')
export class PermissionController {
    constructor(private readonly permissionService: PermissionService) {}

    @Get('list')
    @RequirePermissions(PermissionCode.SYSTEM_PERMISSION_LIST)
    async list(@Query() query: PermissionListQueryDto) {
        return this.permissionService.listPermissions(query)
    }

    @Post()
    @RequirePermissions(PermissionCode.SYSTEM_PERMISSION_ADD)
    async create(@Body() request: CreatePermissionDto) {
        await this.permissionService.createPermission(request)
        return null
    }

    @Put('status')
    @RequirePermissions(PermissionCode.SYSTEM_PERMISSION_UPDATE)
    async updateStatus(@Body() request: UpdatePermissionStatusDto) {
        await this.permissionService.updatePermissionStatus(request)
        return null
    }

    @Delete(':id')
    @RequirePermissions(PermissionCode.SYSTEM_PERMISSION_DELETE)
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.permissionService.deletePermission(id)
        return null
    }

    @Put()
    @RequirePermissions(PermissionCode.SYSTEM_PERMISSION_UPDATE)
    async update(@Body() request: UpdatePermissionDto) {
        await this.permissionService.updatePermission(request)
        return null
    }

    @Get(':id')
    @RequirePermissions(PermissionCode.SYSTEM_PERMISSION_LIST)
    async detail(@Param('id', ParseIntPipe) id: number) {
        return this.permissionService.getPermissionDetail(id)
    }
}
