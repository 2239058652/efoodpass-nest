import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { PageResultDto } from '../../../shared/page/page-result.dto'
import { CreateOperationLogDto } from './dto/create-operation-log.dto'
import { OperationLogListQueryDto } from './dto/operation-log-list-query.dto'
import { OperationLogListResponseDto } from './dto/operation-log-list-response.dto'
import { OperationLogEntity } from './entities/operation-log.entity'

@Injectable()
export class OperationLogService {
    constructor(
        @InjectRepository(OperationLogEntity)
        private readonly operationLogRepository: Repository<OperationLogEntity>,
    ) {}

    async listLogs(query: OperationLogListQueryDto): Promise<PageResultDto<OperationLogListResponseDto>> {
        const qb = this.operationLogRepository.createQueryBuilder('l')

        if (query.module) {
            qb.andWhere('l.module LIKE :module', {
                module: `%${query.module}%`,
            })
        }

        if (query.operation) {
            qb.andWhere('l.operation LIKE :operation', {
                operation: `%${query.operation}%`,
            })
        }

        if (query.username) {
            qb.andWhere('l.username LIKE :username', {
                username: `%${query.username}%`,
            })
        }

        if (query.status !== undefined) {
            qb.andWhere('l.status = :status', { status: query.status })
        }

        qb.orderBy('l.id', 'DESC')
            .skip((query.pageNum - 1) * query.pageSize)
            .take(query.pageSize)

        const [list, total] = await qb.getManyAndCount()

        return new PageResultDto(
            total,
            query.pageNum,
            query.pageSize,
            list.map((item) => ({
                id: item.id,
                userId: item.userId,
                username: item.username,
                module: item.module,
                operation: item.operation,
                requestMethod: item.requestMethod,
                requestUri: item.requestUri,
                ipAddress: item.ipAddress,
                status: item.status,
                errorMessage: item.errorMessage,
                createdAt: item.createdAt,
            })),
        )
    }

    async record(dto: CreateOperationLogDto): Promise<void> {
        await this.operationLogRepository.save(
            this.operationLogRepository.create({
                userId: dto.userId ?? null,
                username: dto.username ?? null,
                module: dto.module,
                operation: dto.operation,
                requestMethod: dto.requestMethod ?? null,
                requestUri: dto.requestUri ?? null,
                requestParams: dto.requestParams ?? null,
                responseData: dto.responseData ?? null,
                ipAddress: dto.ipAddress ?? null,
                status: dto.status,
                errorMessage: dto.errorMessage ?? null,
            }),
        )
    }
}