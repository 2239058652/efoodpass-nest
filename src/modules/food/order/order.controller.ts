import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common'
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator'
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator'
import type { CurrentUser } from '../../../common/interfaces/current-user.interface'
import { CancelOrderDto } from './dto/cancel-order.dto'
import { CreateOrderDto } from './dto/create-order.dto'
import { FinishOrderDto } from './dto/finish-order.dto'
import { OrderListQueryDto } from './dto/order-list-query.dto'
import { ProcessOrderDto } from './dto/process-order.dto'
import { OrderService } from './order.service'
import { OrderStatQueryDto } from './dto/order-stat-query.dto'
import { PermissionCode } from '../../../common/constants/permission.constants'

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
    @RequirePermissions(PermissionCode.FOOD_ITEM_ADD)
    async createCurrentUserOrder(@CurrentUserDecorator() currentUser: CurrentUser, @Body() request: CreateOrderDto) {
        await this.orderService.createCurrentUserOrder(currentUser, request)
        return null
    }

    @Put('process')
    @RequirePermissions(PermissionCode.FOOD_ORDER_PROCESS)
    async process(@Body() request: ProcessOrderDto) {
        await this.orderService.processOrder(request)
        return null
    }

    @Put('finish')
    @RequirePermissions(PermissionCode.FOOD_ORDER_FINISH)
    async finish(@Body() request: FinishOrderDto) {
        await this.orderService.finishOrder(request)
        return null
    }

    @Put('cancel')
    @RequirePermissions(PermissionCode.FOOD_ORDER_CANCEL)
    async cancel(@Body() request: CancelOrderDto) {
        await this.orderService.cancelOrder(request)
        return null
    }

    @Get('current/list')
    async currentUserList(@CurrentUserDecorator() currentUser: CurrentUser, @Query() query: OrderListQueryDto) {
        return this.orderService.listCurrentUserOrders(currentUser, query)
    }

    @Get('current/:id')
    async currentUserDetail(@CurrentUserDecorator() currentUser: CurrentUser, @Param('id', ParseIntPipe) id: number) {
        return this.orderService.getCurrentUserOrderDetail(currentUser, id)
    }

    @Put('current/cancel')
    async currentUserCancel(@CurrentUserDecorator() currentUser: CurrentUser, @Body() request: CancelOrderDto) {
        await this.orderService.cancelCurrentUserOrder(currentUser, request)
        return null
    }

    @Get('stat/overview')
    @RequirePermissions(PermissionCode.FOOD_ORDER_STAT)
    async overview(@Query() query: OrderStatQueryDto) {
        return this.orderService.getOrderOverview(query)
    }

    @Get('stat/status')
    @RequirePermissions(PermissionCode.FOOD_ORDER_STAT)
    async statusStats(@Query() query: OrderStatQueryDto) {
        return this.orderService.getOrderStatusStats(query)
    }

    @Get('stat/hot-items')
    @RequirePermissions(PermissionCode.FOOD_ORDER_STAT)
    async hotItems(@Query() query: OrderStatQueryDto) {
        return this.orderService.getHotItemStats(query)
    }

    @Get('stat/daily-amount')
    @RequirePermissions(PermissionCode.FOOD_ORDER_STAT)
    async dailyAmount(@Query() query: OrderStatQueryDto) {
        return this.orderService.getDailyAmountStats(query)
    }
}
