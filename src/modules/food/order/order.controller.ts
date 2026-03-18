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

@Controller('food/order')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Get('list')
    @RequirePermissions('food:order:list')
    async list(@Query() query: OrderListQueryDto) {
        return this.orderService.listOrders(query)
    }

    @Get(':id')
    @RequirePermissions('food:order:detail')
    async detail(@Param('id', ParseIntPipe) id: number) {
        return this.orderService.getOrderDetail(id)
    }

    @Post()
    @RequirePermissions('food:order:add')
    async createCurrentUserOrder(@CurrentUserDecorator() currentUser: CurrentUser, @Body() request: CreateOrderDto) {
        await this.orderService.createCurrentUserOrder(currentUser, request)
        return null
    }

    @Put('process')
    @RequirePermissions('food:order:process')
    async process(@Body() request: ProcessOrderDto) {
        await this.orderService.processOrder(request)
        return null
    }

    @Put('finish')
    @RequirePermissions('food:order:finish')
    async finish(@Body() request: FinishOrderDto) {
        await this.orderService.finishOrder(request)
        return null
    }

    @Put('cancel')
    @RequirePermissions('food:order:cancel')
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
    @RequirePermissions('food:order:stat')
    async overview(@Query() query: OrderStatQueryDto) {
        return this.orderService.getOrderOverview(query)
    }

    @Get('stat/status')
    @RequirePermissions('food:order:stat')
    async statusStats(@Query() query: OrderStatQueryDto) {
        return this.orderService.getOrderStatusStats(query)
    }

    @Get('stat/hot-items')
    @RequirePermissions('food:order:stat')
    async hotItems(@Query() query: OrderStatQueryDto) {
        return this.orderService.getHotItemStats(query)
    }

    @Get('stat/daily-amount')
    @RequirePermissions('food:order:stat')
    async dailyAmount(@Query() query: OrderStatQueryDto) {
        return this.orderService.getDailyAmountStats(query)
    }
}
