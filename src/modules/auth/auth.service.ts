import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { In, Repository } from 'typeorm'
import { BizErrorCode } from '../../common/constants/biz-error-code'
import { BusinessException } from '../../common/exceptions/business.exception'
import { CurrentUser } from '../../common/interfaces/current-user.interface'
import { LoginDto } from './dto/login.dto'
import { LoginResponseDto } from './dto/login-response.dto'
import { CurrentUserResponseDto } from './dto/current-user-response.dto'
import { UserEntity } from '../system/user/entities/user.entity'
import { UserRoleEntity } from '../system/user/entities/user-role.entity'
import { RoleEntity } from '../system/role/entities/role.entity'
import { RolePermissionEntity } from '../system/role/entities/role-permission.entity'
import { PermissionEntity } from '../system/permission/entities/permission.entity'

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
        private readonly configService: ConfigService,
    ) {}

    async login(loginDto: LoginDto): Promise<LoginResponseDto> {
        const user = await this.userRepository.findOne({
            where: { username: loginDto.username },
        })

        if (!user) {
            throw new BusinessException(BizErrorCode.USERNAME_OR_PASSWORD_INVALID, '用户名或密码错误')
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password)
        if (!isPasswordValid) {
            throw new BusinessException(BizErrorCode.USERNAME_OR_PASSWORD_INVALID, '用户名或密码错误')
        }

        if (user.status !== 1) {
            throw new BusinessException(BizErrorCode.USER_DISABLED, '用户已被禁用')
        }

        const { roleCodes, permCodes } = await this.loadUserAuthInfo(user.id)

        const payload: CurrentUser = {
            userId: user.id,
            username: user.username,
            status: user.status,
            tokenVersion: user.tokenVersion,
            roleCodes,
            permCodes,
        }

        const accessToken = await this.jwtService.signAsync(payload)

        return {
            accessToken,
            tokenType: 'Bearer',
            expiresIn: this.configService.get<string>('jwt.expiresIn', '7d'),
            userInfo: {
                userId: user.id,
                username: user.username,
                nickname: user.nickname,
                roleCodes,
                permCodes,
            },
        }
    }

    async getCurrentUser(userId: number): Promise<CurrentUserResponseDto> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        })

        if (!user) {
            throw new BusinessException(BizErrorCode.USER_NOT_FOUND, '用户不存在')
        }

        const { roleCodes, permCodes } = await this.loadUserAuthInfo(user.id)

        return {
            userId: user.id,
            username: user.username,
            nickname: user.nickname,
            status: user.status,
            tokenVersion: user.tokenVersion,
            roleCodes,
            permCodes,
        }
    }

    async validateJwtUser(payload: CurrentUser): Promise<CurrentUser> {
        const user = await this.userRepository.findOne({
            where: { id: payload.userId },
        })

        if (!user) {
            throw new BusinessException(BizErrorCode.USER_NOT_FOUND, '用户不存在')
        }

        if (user.status !== 1) {
            throw new BusinessException(BizErrorCode.USER_DISABLED, '用户已被禁用')
        }

        if (user.tokenVersion !== payload.tokenVersion) {
            throw new BusinessException(BizErrorCode.TOKEN_INVALID, 'token 已失效')
        }

        const { roleCodes, permCodes } = await this.loadUserAuthInfo(user.id)

        return {
            userId: user.id,
            username: user.username,
            status: user.status,
            tokenVersion: user.tokenVersion,
            roleCodes,
            permCodes,
        }
    }

    private async loadUserAuthInfo(userId: number): Promise<{
        roleCodes: string[]
        permCodes: string[]
    }> {
        const userRoles = await this.userRoleRepository.find({
            where: { userId },
        })

        if (userRoles.length === 0) {
            return {
                roleCodes: [],
                permCodes: [],
            }
        }

        const roleIds = userRoles.map((item) => item.roleId)
        const roles = await this.roleRepository.find({
            where: {
                id: In(roleIds),
            },
        })

        const enabledRoles = roles.filter((role) => role.status === 1)
        const roleCodes = enabledRoles.map((role) => role.roleCode)

        if (enabledRoles.length === 0) {
            return {
                roleCodes,
                permCodes: [],
            }
        }

        const rolePermissions = await this.rolePermissionRepository.find({
            where: {
                roleId: In(enabledRoles.map((role) => role.id)),
            },
        })

        if (rolePermissions.length === 0) {
            return {
                roleCodes,
                permCodes: [],
            }
        }

        const permissionIds = rolePermissions.map((item) => item.permissionId)
        const permissions = await this.permissionRepository.find({
            where: {
                id: In(permissionIds),
            },
        })

        const permCodes = [
            ...new Set(
                permissions.filter((permission) => permission.status === 1).map((permission) => permission.permCode),
            ),
        ]

        return {
            roleCodes,
            permCodes,
        }
    }
}
