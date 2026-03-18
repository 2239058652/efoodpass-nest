import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { In, Repository } from 'typeorm'
import { BusinessException } from '../../common/exceptions/business.exception'
import type { CurrentUser } from '../../common/interfaces/current-user.interface'
import { LoginDto } from './dto/login.dto'
import { LoginResponseDto } from './dto/login-response.dto'
import { CurrentUserResponseDto } from './dto/current-user-response.dto'
import { UserEntity } from '../system/user/entities/user.entity'
import { UserRoleEntity } from '../system/user/entities/user-role.entity'
import { RoleEntity } from '../system/role/entities/role.entity'
import { RolePermissionEntity } from '../system/role/entities/role-permission.entity'
import { PermissionEntity } from '../system/permission/entities/permission.entity'
import { OperationLogService } from '../system/operation-log/operation-log.service'
import { BizErrorCode } from '../../common/constants/biz-error-code'

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(UserRoleEntity)
        private readonly userRoleRepository: Repository<UserRoleEntity>,
        @InjectRepository(RoleEntity)
        private readonly roleRepository: Repository<RoleEntity>,
        @InjectRepository(RolePermissionEntity)
        private readonly rolePermissionRepository: Repository<RolePermissionEntity>,
        @InjectRepository(PermissionEntity)
        private readonly permissionRepository: Repository<PermissionEntity>,
        private readonly jwtService: JwtService,
        private readonly operationLogService: OperationLogService,
    ) {}

    /**
     * 登录
     * @param loginDto
     */
    async login(loginDto: LoginDto): Promise<LoginResponseDto> {
        const user = await this.userRepository.findOne({
            where: { username: loginDto.username },
        })

        if (!user) {
            throw new BusinessException(BizErrorCode.AUTH_LOGIN_FAILED, '用户名或密码错误')
        }

        if (user.status !== 1) {
            throw new BusinessException(BizErrorCode.AUTH_USER_DISABLED, '用户已被禁用')
        }

        const matched = await bcrypt.compare(loginDto.password, user.passwordHash)
        if (!matched) {
            throw new BusinessException(BizErrorCode.AUTH_LOGIN_FAILED, '用户名或密码错误')
        }

        const token = await this.jwtService.signAsync({
            userId: user.id,
            username: user.username,
            nickname: user.nickname,
            tokenVersion: user.tokenVersion ?? 0,
        })

        await this.operationLogService.record({
            userId: user.id,
            username: user.username,
            module: '认证管理',
            operation: '用户登录',
            requestMethod: 'POST',
            requestUri: '/auth/login',
            requestParams: JSON.stringify({
                username: loginDto.username,
            }),
            responseData: JSON.stringify({
                userId: user.id,
                username: user.username,
            }),
            status: 1,
        })

        return {
            token,
            userId: user.id,
            username: user.username,
            nickname: user.nickname,
        }
    }

    async getCurrentUser(userId: number): Promise<CurrentUserResponseDto> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        })

        if (!user) {
            throw new BusinessException(BizErrorCode.AUTH_USER_NOT_FOUND, '用户不存在')
        }

        const roleCodes = await this.getRoleCodesByUserId(userId)
        const permissionCodes = await this.getPermissionCodesByUserId(userId)

        return {
            userId: user.id,
            username: user.username,
            nickname: user.nickname,
            roleCodes,
            permissionCodes,
        }
    }

    async validateJwtUser(payload: {
        userId: number
        username: string
        nickname?: string | null
        tokenVersion: number
    }): Promise<CurrentUser> {
        const user = await this.userRepository.findOne({
            where: { id: payload.userId },
        })

        if (!user) {
            throw new BusinessException(BizErrorCode.AUTH_USER_NOT_FOUND, '用户不存在')
        }

        if (user.status !== 1) {
            throw new BusinessException(BizErrorCode.AUTH_USER_DISABLED, '用户已被禁用')
        }

        if ((user.tokenVersion ?? 0) !== payload.tokenVersion) {
            throw new BusinessException(BizErrorCode.AUTH_TOKEN_INVALID, '登录状态已失效')
        }

        const roleCodes = await this.getRoleCodesByUserId(user.id)
        const permissionCodes = await this.getPermissionCodesByUserId(user.id)

        return {
            userId: user.id,
            username: user.username,
            nickname: user.nickname,
            tokenVersion: user.tokenVersion ?? 0,
            roleCodes,
            permissionCodes,
        }
    }

    private async getRoleCodesByUserId(userId: number): Promise<string[]> {
        const userRoles = await this.userRoleRepository.find({
            where: { userId },
        })

        if (userRoles.length === 0) {
            return []
        }

        const roles = await this.roleRepository.find({
            where: {
                id: In(userRoles.map((item) => item.roleId)),
            },
        })

        return roles.map((item) => item.roleCode)
    }

    private async getPermissionCodesByUserId(userId: number): Promise<string[]> {
        const userRoles = await this.userRoleRepository.find({
            where: { userId },
        })

        if (userRoles.length === 0) {
            return []
        }

        const roles = await this.roleRepository.find({
            where: {
                id: In(userRoles.map((item) => item.roleId)),
            },
        })

        if (roles.length === 0) {
            return []
        }

        const rolePermissions = await this.rolePermissionRepository.find({
            where: {
                roleId: In(roles.map((item) => item.id)),
            },
        })

        if (rolePermissions.length === 0) {
            return []
        }

        const permissions = await this.permissionRepository.find({
            where: {
                id: In(rolePermissions.map((item) => item.permissionId)),
            },
        })

        return permissions.map((item) => item.permCode)
    }
}
