import { Controller, Get, Query } from '@nestjs/common'
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator'
import { OperationLogListQueryDto } from './dto/operation-log-list-query.dto'
import { OperationLogService } from './operation-log.service'

@Controller('system/operation-log')
export class OperationLogController {
    constructor(private readonly operationLogService: OperationLogService) {}

    @Get('list')
    @RequirePermissions('system:operation-log:list')
    async list(@Query() query: OperationLogListQueryDto) {
        return this.operationLogService.listLogs(query)
    }
}
