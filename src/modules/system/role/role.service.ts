import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { BusinessException } from '../../../common/exceptions/business.exception'
import { PageResultDto } from '../../../shared/page/page-result.dto'
import { PermissionEntity } from '../permission/entities/permission.entity'
import { AssignRolePermissionDto } from './dto/assign-role-permissions.dto'
import { CreateRoleDto } from './dto/create-role.dto'
import { RoleDetailResponseDto } from './dto/role-detail-response.dto'
import { RoleListQueryDto } from './dto/role-list-query.dto'
import { RoleListResponseDto } from './dto/role-list-response.dto'
import { UpdateRoleStatusDto } from './dto/update-role-status.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { RoleEntity } from './entities/role.entity'
import { RolePermissionEntity } from './entities/role-permission.entity'
import { BizErrorCode } from '../../../common/constants/biz-error-code'
import { OperationLogService } from '../operation-log/operation-log.service'

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(RoleEntity)
        private readonly roleRepository: Repository<RoleEntity>,
        @InjectRepository(RolePermissionEntity)
        private readonly rolePermissionRepository: Repository<RolePermissionEntity>,
        @InjectRepository(PermissionEntity)
        private readonly permissionRepository: Repository<PermissionEntity>,
        private readonly operationLogService: OperationLogService,
    ) {}

    async listRoles(query: RoleListQueryDto): Promise<PageResultDto<RoleListResponseDto>> {
        const qb = this.roleRepository.createQueryBuilder('r')

        if (query.roleCode) {
            qb.andWhere('r.roleCode LIKE :roleCode', {
                roleCode: `%${query.roleCode}%`,
            })
        }

        if (query.status !== undefined) {
            qb.andWhere('r.status = :status', { status: query.status })
        }

        qb.orderBy('r.id', 'DESC')
            .skip((query.pageNum - 1) * query.pageSize)
            .take(query.pageSize)

        const [roles, total] = await qb.getManyAndCount()

        return new PageResultDto(
            total,
            query.pageNum,
            query.pageSize,
            roles.map((item) => ({
                id: item.id,
                roleCode: item.roleCode,
                roleName: item.roleName,
                status: item.status,
            })),
        )
    }

    async createRole(request: CreateRoleDto): Promise<void> {
        const exist = await this.roleRepository.findOne({
            where: { roleCode: request.roleCode },
        })

        if (exist) {
            throw new BusinessException(BizErrorCode.ROLE_CODE_DUPLICATE, '角色编码已存在')
        }

        if (![0, 1].includes(request.status)) {
            throw new BusinessException(BizErrorCode.ROLE_STATUS_INVALID, '角色状态值不合法')
        }

        await this.roleRepository.save(
            this.roleRepository.create({
                roleCode: request.roleCode,
                roleName: request.roleName,
                status: request.status,
            }),
        )
    }

    async assignPermissions(request: AssignRolePermissionDto): Promise<void> {
        const role = await this.roleRepository.findOne({
            where: { id: request.roleId },
        })

        if (!role) {
            throw new BusinessException(BizErrorCode.ROLE_NOT_FOUND, '角色不存在')
        }

        const permissionCount = await this.permissionRepository.count({
            where: {
                id: In(request.permissionIds),
                status: 1,
            },
        })

        if (permissionCount !== request.permissionIds.length) {
            throw new BusinessException(BizErrorCode.PERMISSION_NOT_FOUND_OR_DISABLED, '权限不存在或已禁用')
        }

        await this.rolePermissionRepository.delete({ roleId: request.roleId })

        await this.rolePermissionRepository.save(
            request.permissionIds.map((permissionId) =>
                this.rolePermissionRepository.create({
                    roleId: request.roleId,
                    permissionId,
                }),
            ),
        )
        await this.operationLogService.record({
            userId: null,
            username: null,
            module: '角色管理',
            operation: '分配权限',
            requestMethod: 'POST',
            requestUri: '/system/role/assign-permission',
            requestParams: JSON.stringify({
                roleId: request.roleId,
                permissionIds: request.permissionIds,
            }),
            responseData: JSON.stringify({
                roleId: request.roleId,
                permissionCount: request.permissionIds.length,
            }),
            status: 1,
        })
    }

    async updateRoleStatus(request: UpdateRoleStatusDto): Promise<void> {
        const role = await this.roleRepository.findOne({
            where: { id: request.roleId },
        })

        if (!role) {
            throw new BusinessException(BizErrorCode.ROLE_NOT_FOUND, '角色不存在')
        }

        if (![0, 1].includes(request.status)) {
            throw new BusinessException(BizErrorCode.ROLE_STATUS_INVALID, '角色状态值不合法')
        }

        if (role.roleCode === 'ADMIN' && request.status === 0) {
            throw new BusinessException(BizErrorCode.ROLE_ADMIN_DISABLE_FORBIDDEN, '系统管理员角色不能被禁用')
        }

        role.status = request.status
        await this.roleRepository.save(role)
    }

    async deleteRole(id: number): Promise<void> {
        const role = await this.roleRepository.findOne({
            where: { id },
        })

        if (!role) {
            throw new BusinessException(BizErrorCode.ROLE_NOT_FOUND, '角色不存在')
        }

        if (role.roleCode === 'ADMIN') {
            throw new BusinessException(BizErrorCode.ROLE_ADMIN_DELETE_FORBIDDEN, '系统管理员角色不能被删除')
        }

        await this.rolePermissionRepository.delete({ roleId: id })
        await this.roleRepository.delete(id)
    }

    async getRoleDetail(id: number): Promise<RoleDetailResponseDto> {
        const role = await this.roleRepository.findOne({
            where: { id },
        })

        if (!role) {
            throw new BusinessException(BizErrorCode.ROLE_NOT_FOUND, '角色不存在')
        }

        const relations = await this.rolePermissionRepository.find({
            where: { roleId: id },
        })

        return {
            id: role.id,
            roleCode: role.roleCode,
            roleName: role.roleName,
            status: role.status,
            permissionIds: relations.map((item) => item.permissionId),
        }
    }

    async updateRole(request: UpdateRoleDto): Promise<void> {
        const role = await this.roleRepository.findOne({
            where: { id: request.id },
        })

        if (!role) {
            throw new BusinessException(BizErrorCode.ROLE_NOT_FOUND, '角色不存在')
        }

        if (![0, 1].includes(request.status)) {
            throw new BusinessException(BizErrorCode.ROLE_STATUS_INVALID, '角色状态值不合法')
        }

        if (role.roleCode === 'ADMIN' && request.status === 0) {
            throw new BusinessException(BizErrorCode.ROLE_ADMIN_DISABLE_FORBIDDEN, '系统管理员角色不能被禁用')
        }

        role.roleName = request.roleName
        role.status = request.status
        await this.roleRepository.save(role)
    }
}
