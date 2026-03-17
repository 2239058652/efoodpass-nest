import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { BizErrorCode } from '../constants/biz-error-code'
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator'
import type { CurrentUser } from '../interfaces/current-user.interface'
import { BusinessException } from '../exceptions/business.exception'

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions =
            this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]) ??
            []

        if (requiredPermissions.length === 0) {
            return true
        }

        const request = context.switchToHttp().getRequest<{ user?: CurrentUser }>()

        const currentUser = request.user
        if (!currentUser) {
            throw new ForbiddenException('当前用户上下文不存在')
        }

        const codeSet = new Set(currentUser.permissionCodes ?? [])
        const hasPermission = requiredPermissions.every((code) => codeSet.has(code))

        if (!hasPermission) {
            throw new BusinessException(BizErrorCode.FORBIDDEN, '无权限访问该接口')
        }

        return true
    }
}
