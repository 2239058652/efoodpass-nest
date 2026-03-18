import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common'
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator'
import { AssignUserRoleDto } from './dto/assign-user-roles.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { ResetUserPasswordDto } from './dto/reset-user-password.dto'
import { UpdateUserStatusDto } from './dto/update-user-status.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserListQueryDto } from './dto/user-list-query.dto'
import { UserService } from './user.service'
import { PermissionCode } from '../../../common/constants/permission.constants'

@Controller('system/user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('list')
    @RequirePermissions(PermissionCode.SYSTEM_USER_LIST)
    async list(@Query() query: UserListQueryDto) {
        return this.userService.listUsers(query)
    }

    @Post()
    @RequirePermissions(PermissionCode.SYSTEM_USER_ADD)
    async create(@Body() request: CreateUserDto) {
        await this.userService.createUser(request)
        return null
    }

    @Post('assign-role')
    @RequirePermissions(PermissionCode.SYSTEM_USER_ASSIGN_ROLE)
    async assignRole(@Body() request: AssignUserRoleDto) {
        await this.userService.assignRoles(request)
        return null
    }

    @Put('status')
    @RequirePermissions(PermissionCode.SYSTEM_USER_UPDATE)
    async updateStatus(@Body() request: UpdateUserStatusDto) {
        await this.userService.updateUserStatus(request)
        return null
    }

    @Delete(':id')
    @RequirePermissions(PermissionCode.SYSTEM_USER_DELETE)
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.userService.deleteUser(id)
        return null
    }

    @Put()
    @RequirePermissions(PermissionCode.SYSTEM_USER_UPDATE)
    async update(@Body() request: UpdateUserDto) {
        await this.userService.updateUser(request)
        return null
    }

    @Put('reset-password')
    @RequirePermissions(PermissionCode.SYSTEM_USER_UPDATE)
    async resetPassword(@Body() request: ResetUserPasswordDto) {
        await this.userService.resetPassword(request)
        return null
    }

    @Get(':id')
    @RequirePermissions(PermissionCode.SYSTEM_USER_LIST)
    async detail(@Param('id', ParseIntPipe) id: number) {
        return this.userService.getUserDetail(id)
    }
}
