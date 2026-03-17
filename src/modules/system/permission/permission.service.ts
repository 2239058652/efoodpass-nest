import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BusinessException } from '../../../common/exceptions/business.exception'
import { PageResultDto } from '../../../shared/page/page-result.dto'
import { CreatePermissionDto } from './dto/create-permission.dto'
import { PermissionDetailResponseDto } from './dto/permission-detail-response.dto'
import { PermissionListQueryDto } from './dto/permission-list-query.dto'
import { PermissionListResponseDto } from './dto/permission-list-response.dto'
import { UpdatePermissionStatusDto } from './dto/update-permission-status.dto'
import { UpdatePermissionDto } from './dto/update-permission.dto'
import { PermissionEntity } from './entities/permission.entity'

@Injectable()
export class PermissionService {
    constructor(
        @InjectRepository(PermissionEntity)
        private readonly permissionRepository: Repository<PermissionEntity>,
    ) {}

    async listPermissions(query: PermissionListQueryDto): Promise<PageResultDto<PermissionListResponseDto>> {
        const qb = this.permissionRepository.createQueryBuilder('p')

        if (query.permCode) {
            qb.andWhere('p.permCode LIKE :permCode', {
                permCode: `%${query.permCode}%`,
            })
        }

        if (query.status !== undefined) {
            qb.andWhere('p.status = :status', { status: query.status })
        }

        qb.orderBy('p.id', 'DESC')
            .skip((query.pageNum - 1) * query.pageSize)
            .take(query.pageSize)

        const [items, total] = await qb.getManyAndCount()

        return new PageResultDto(
            total,
            query.pageNum,
            query.pageSize,
            items.map((item) => ({
                id: item.id,
                permCode: item.permCode,
                permName: item.permName,
                permType: item.permType,
                path: item.path,
                method: item.method,
                status: item.status,
            })),
        )
    }

    async createPermission(request: CreatePermissionDto): Promise<void> {
        const exist = await this.permissionRepository.findOne({
            where: { permCode: request.permCode },
        })

        if (exist) {
            throw new BusinessException(4201, '权限编码已存在')
        }

        if (![0, 1].includes(request.status)) {
            throw new BusinessException(4210, '权限状态值不合法')
        }

        await this.permissionRepository.save(
            this.permissionRepository.create({
                permCode: request.permCode,
                permName: request.permName,
                permType: request.permType,
                path: request.path ?? null,
                method: request.method ?? null,
                status: request.status,
            }),
        )
    }

    async updatePermissionStatus(request: UpdatePermissionStatusDto): Promise<void> {
        const permission = await this.permissionRepository.findOne({
            where: { id: request.permissionId },
        })

        if (!permission) {
            throw new BusinessException(4204, '权限不存在')
        }

        if (![0, 1].includes(request.status)) {
            throw new BusinessException(4210, '权限状态值不合法')
        }

        permission.status = request.status
        await this.permissionRepository.save(permission)
    }

    async deletePermission(id: number): Promise<void> {
        const permission = await this.permissionRepository.findOne({
            where: { id },
        })

        if (!permission) {
            throw new BusinessException(4204, '权限不存在')
        }

        await this.permissionRepository.delete(id)
    }

    async updatePermission(request: UpdatePermissionDto): Promise<void> {
        const permission = await this.permissionRepository.findOne({
            where: { id: request.id },
        })

        if (!permission) {
            throw new BusinessException(4204, '权限不存在')
        }

        if (![0, 1].includes(request.status)) {
            throw new BusinessException(4210, '权限状态值不合法')
        }

        permission.permName = request.permName
        permission.permType = request.permType
        permission.path = request.path ?? null
        permission.method = request.method ?? null
        permission.status = request.status

        await this.permissionRepository.save(permission)
    }

    async getPermissionDetail(id: number): Promise<PermissionDetailResponseDto> {
        const permission = await this.permissionRepository.findOne({
            where: { id },
        })

        if (!permission) {
            throw new BusinessException(4204, '权限不存在')
        }

        return {
            id: permission.id,
            permCode: permission.permCode,
            permName: permission.permName,
            permType: permission.permType,
            path: permission.path,
            method: permission.method,
            status: permission.status,
        }
    }
}
