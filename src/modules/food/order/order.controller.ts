import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common'
import { PermissionCode } from '../../../common/constants/permission.constants'
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator'
import { CancelOrderDto } from './dto/cancel-order.dto'
import { CreateOrderDto } from './dto/create-order.dto'
import { FinishOrderDto } from './dto/finish-order.dto'
import { OrderListQueryDto } from './dto/order-list-query.dto'
import { ProcessOrderDto } from './dto/process-order.dto'
import { OrderService } from './order.service'

@Controller('food/order')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Get('list')
    @RequirePermissions(PermissionCode.FOOD_ORDER_LIST)
    async list(@Query() query: OrderListQueryDto) {
        return this.orderService.listOrders(query)
    }

    @Get(':id')
    @RequirePermissions(PermissionCode.FOOD_ORDER_DETAIL)
    async detail(@Param('id', ParseIntPipe) id: number) {
        return this.orderService.getOrderDetail(id)
    }

    @Post()
    @RequirePermissions(PermissionCode.FOOD_ORDER_ADD)
    async create(@Body() request: CreateOrderDto) {
        await this.orderService.createOrder(request)
        return null
    }

    @Put('process')
    @RequirePermissions(PermissionCode.FOOD_ORDER_PROCESS)
    async process(@Body() request: ProcessOrderDto) {
        await this.orderService.processOrder(request)
        return null
    }

    @Put('cancel')
    @RequirePermissions(PermissionCode.FOOD_ORDER_CANCEL)
    async cancel(@Body() request: CancelOrderDto) {
        await this.orderService.cancelOrder(request)
        return null
    }

    @Put('complete')
    @RequirePermissions(PermissionCode.FOOD_ORDER_COMPLETE)
    async complete(@Body() request: FinishOrderDto) {
        await this.orderService.completeOrder(request)
        return null
    }
}
