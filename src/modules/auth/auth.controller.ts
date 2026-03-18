import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { Public } from '../../common/decorators/public.decorator'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUserDecorator } from '../../common/decorators/current-user.decorator'
import type { CurrentUser } from '../../common/interfaces/current-user.interface'
import { PermissionsGuard } from '../../common/guards/permissions.guard'
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger'

@Controller('auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto)
    }

    @Get('me')
    @ApiOperation({ summary: '获取当前用户信息' })
    async me(@CurrentUserDecorator() currentUser: CurrentUser) {
        return this.authService.getCurrentUser(currentUser.userId)
    }
}
