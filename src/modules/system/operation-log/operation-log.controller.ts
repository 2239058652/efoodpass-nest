import { Controller, Get, Query } from '@nestjs/common'
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator'
import { OperationLogListQueryDto } from './dto/operation-log-list-query.dto'
import { OperationLogService } from './operation-log.service'
import { PermissionCode } from '../../../common/constants/permission.constants'

@Controller('system/operation-log')
export class OperationLogController {
    constructor(private readonly operationLogService: OperationLogService) {}

    @Get('list')
    @RequirePermissions(PermissionCode.SYSTEM_OPERATION_LOG_LIST)
    async list(@Query() query: OperationLogListQueryDto) {
        return this.operationLogService.listLogs(query)
    }
}
