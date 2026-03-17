import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common'
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator'
import { AssignUserRoleDto } from './dto/assign-user-roles.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { ResetUserPasswordDto } from './dto/reset-user-password.dto'
import { UpdateUserStatusDto } from './dto/update-user-status.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserListQueryDto } from './dto/user-list-query.dto'
import { UserService } from './user.service'

@Controller('system/user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('list')
    @RequirePermissions('system:user:list')
    async list(@Query() query: UserListQueryDto) {
        return this.userService.listUsers(query)
    }

    @Post()
    @RequirePermissions('system:user:add')
    async create(@Body() request: CreateUserDto) {
        await this.userService.createUser(request)
        return null
    }

    @Post('assign-role')
    @RequirePermissions('system:user:assign-role')
    async assignRole(@Body() request: AssignUserRoleDto) {
        await this.userService.assignRoles(request)
        return null
    }

    @Put('status')
    @RequirePermissions('system:user:update')
    async updateStatus(@Body() request: UpdateUserStatusDto) {
        await this.userService.updateUserStatus(request)
        return null
    }

    @Delete(':id')
    @RequirePermissions('system:user:delete')
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.userService.deleteUser(id)
        return null
    }

    @Put()
    @RequirePermissions('system:user:update')
    async update(@Body() request: UpdateUserDto) {
        await this.userService.updateUser(request)
        return null
    }

    @Put('reset-password')
    @RequirePermissions('system:user:update')
    async resetPassword(@Body() request: ResetUserPasswordDto) {
        await this.userService.resetPassword(request)
        return null
    }

    @Get(':id')
    @RequirePermissions('system:user:list')
    async detail(@Param('id', ParseIntPipe) id: number) {
        return this.userService.getUserDetail(id)
    }
}
