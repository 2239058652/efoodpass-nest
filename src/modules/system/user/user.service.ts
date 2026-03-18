import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import { In, Repository } from 'typeorm'
import { BusinessException } from '../../../common/exceptions/business.exception'
import { PageResultDto } from '../../../shared/page/page-result.dto'
import { RoleEntity } from '../role/entities/role.entity'
import { UserEntity } from './entities/user.entity'
import { UserRoleEntity } from './entities/user-role.entity'
import { AssignUserRoleDto } from './dto/assign-user-roles.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { ResetUserPasswordDto } from './dto/reset-user-password.dto'
import { UpdateUserStatusDto } from './dto/update-user-status.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserDetailResponseDto } from './dto/user-detail-response.dto'
import { UserListQueryDto } from './dto/user-list-query.dto'
import { UserListResponseDto } from './dto/user-list-response.dto'
import { BizErrorCode } from '../../../common/constants/biz-error-code'

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        @InjectRepository(UserRoleEntity)
        private readonly userRoleRepository: Repository<UserRoleEntity>,
        @InjectRepository(RoleEntity)
        private readonly roleRepository: Repository<RoleEntity>,
    ) {}

    async listUsers(query: UserListQueryDto): Promise<PageResultDto<UserListResponseDto>> {
        const qb = this.userRepository.createQueryBuilder('u')

        if (query.username) {
            qb.andWhere('u.username LIKE :username', {
                username: `%${query.username}%`,
            })
        }

        if (query.status !== undefined) {
            qb.andWhere('u.status = :status', { status: query.status })
        }

        qb.orderBy('u.id', 'DESC')
            .skip((query.pageNum - 1) * query.pageSize)
            .take(query.pageSize)

        const [users, total] = await qb.getManyAndCount()
        const records = await Promise.all(users.map((user) => this.toUserListResponse(user)))

        return new PageResultDto(total, query.pageNum, query.pageSize, records)
    }

    async createUser(request: CreateUserDto): Promise<void> {
        const existUser = await this.userRepository.findOne({
            where: { username: request.username },
        })

        if (existUser) {
            throw new BusinessException(BizErrorCode.AUTH_LOGIN_FAILED, '用户名已存在')
        }

        const passwordHash = await bcrypt.hash(request.password, 10)

        const user = this.userRepository.create({
            username: request.username,
            passwordHash,
            nickname: request.nickname,
            phone: request.phone ?? null,
            status: request.status,
            tokenVersion: 0,
        })

        await this.userRepository.save(user)
    }

    async assignRoles(request: AssignUserRoleDto): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id: request.userId },
        })

        if (!user) {
            throw new BusinessException(BizErrorCode.AUTH_USER_NOT_FOUND, '用户不存在')
        }

        const roleCount = await this.roleRepository.count({
            where: {
                id: In(request.roleIds),
                status: 1,
            },
        })

        if (roleCount !== request.roleIds.length) {
            throw new BusinessException(BizErrorCode.AUTH_ROLE_NOT_FOUND_OR_DISABLED, '角色不存在或已禁用')
        }

        await this.userRoleRepository.delete({ userId: request.userId })

        const relations = request.roleIds.map((roleId) =>
            this.userRoleRepository.create({
                userId: request.userId,
                roleId,
            }),
        )

        await this.userRoleRepository.save(relations)
    }

    async updateUserStatus(request: UpdateUserStatusDto): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id: request.userId },
        })

        if (!user) {
            throw new BusinessException(BizErrorCode.AUTH_USER_NOT_FOUND, '用户不存在')
        }

        if (![0, 1].includes(request.status)) {
            throw new BusinessException(BizErrorCode.USER_STATUS_INVALID, '用户状态值不合法')
        }

        if (user.username === 'admin' && request.status === 0) {
            throw new BusinessException(BizErrorCode.USER_ADMIN_DISABLE_FORBIDDEN, '系统管理员不能被禁用')
        }

        user.status = request.status
        await this.userRepository.save(user)
    }

    async deleteUser(userId: number): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        })

        if (!user) {
            throw new BusinessException(BizErrorCode.AUTH_USER_NOT_FOUND, '用户不存在')
        }

        if (user.username === 'admin') {
            throw new BusinessException(BizErrorCode.USER_ADMIN_DELETE_FORBIDDEN, '系统管理员不能被删除')
        }

        await this.userRoleRepository.delete({ userId })
        await this.userRepository.delete(userId)
    }

    async updateUser(request: UpdateUserDto): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id: request.id },
        })

        if (!user) {
            throw new BusinessException(BizErrorCode.AUTH_USER_NOT_FOUND, '用户不存在')
        }

        if (![0, 1].includes(request.status)) {
            throw new BusinessException(BizErrorCode.USER_STATUS_INVALID, '用户状态值不合法')
        }

        if (user.username === 'admin' && request.status === 0) {
            throw new BusinessException(BizErrorCode.USER_ADMIN_DISABLE_FORBIDDEN, '系统管理员不能被禁用')
        }

        user.nickname = request.nickname
        user.phone = request.phone ?? null
        user.status = request.status

        await this.userRepository.save(user)
    }

    async resetPassword(request: ResetUserPasswordDto): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id: request.userId },
        })

        if (!user) {
            throw new BusinessException(BizErrorCode.AUTH_USER_NOT_FOUND, '用户不存在')
        }

        user.passwordHash = await bcrypt.hash(request.newPassword, 10)
        user.tokenVersion = (user.tokenVersion ?? 0) + 1

        await this.userRepository.save(user)
    }

    async getUserDetail(userId: number): Promise<UserDetailResponseDto> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        })

        if (!user) {
            throw new BusinessException(BizErrorCode.AUTH_USER_NOT_FOUND, '用户不存在')
        }

        const userRoles = await this.userRoleRepository.find({
            where: { userId },
        })

        return {
            id: user.id,
            username: user.username,
            nickname: user.nickname,
            phone: user.phone,
            status: user.status,
            roleIds: userRoles.map((item) => item.roleId),
        }
    }

    private async toUserListResponse(user: UserEntity): Promise<UserListResponseDto> {
        const userRoles = await this.userRoleRepository.find({
            where: { userId: user.id },
        })

        const roleIds = userRoles.map((item) => item.roleId)
        const roles = roleIds.length
            ? await this.roleRepository.find({
                  where: { id: In(roleIds) },
              })
            : []

        return {
            id: user.id,
            username: user.username,
            nickname: user.nickname,
            phone: user.phone,
            status: user.status,
            roleCodes: roles.map((item) => item.roleCode),
        }
    }
}
