import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OperationLogController } from './operation-log.controller'
import { OperationLogService } from './operation-log.service'
import { OperationLogEntity } from './entities/operation-log.entity'

@Module({
    imports: [TypeOrmModule.forFeature([OperationLogEntity])],
    controllers: [OperationLogController],
    providers: [OperationLogService],
    exports: [OperationLogService],
})
export class OperationLogModule {}
