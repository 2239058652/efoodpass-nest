import { Injectable } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, In, Repository } from 'typeorm'
import { BusinessException } from '../../../common/exceptions/business.exception'
import { OrderStatus } from '../../../common/constants/order.constants'
import { PageResultDto } from '../../../shared/page/page-result.dto'
import { CurrentUser } from '../../../common/interfaces/current-user.interface'
import { UserEntity } from '../../system/user/entities/user.entity'
import { FoodCategoryEntity } from '../category/entities/food-category.entity'
import { FoodItemEntity } from '../item/entities/food-item.entity'
import { CancelOrderDto } from './dto/cancel-order.dto'
import { CreateOrderDto } from './dto/create-order.dto'
import { FinishOrderDto } from './dto/finish-order.dto'
import { OrderDetailResponseDto } from './dto/order-detail-response.dto'
import { OrderListQueryDto } from './dto/order-list-query.dto'
import { OrderListResponseDto } from './dto/order-list-response.dto'
import { ProcessOrderDto } from './dto/process-order.dto'
import { FoodOrderEntity } from './entities/food-order.entity'
import { FoodOrderItemEntity } from './entities/food-order-item.entity'
import { OrderStatQueryDto } from './dto/order-stat-query.dto'
import { OrderOverviewResponseDto } from './dto/order-overview-response.dto'
import { OrderStatusStatResponseDto } from './dto/order-status-stat-response.dto'
import { HotItemStatResponseDto } from './dto/hot-item-stat-response.dto'
import { DailyAmountStatResponseDto } from './dto/daily-amount-stat-response.dto'
import { BizErrorCode } from '../../../common/constants/biz-error-code'

@Injectable()
export class OrderService {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
        @InjectRepository(FoodOrderEntity)
        private readonly orderRepository: Repository<FoodOrderEntity>,
        @InjectRepository(FoodOrderItemEntity)
        private readonly orderItemRepository: Repository<FoodOrderItemEntity>,
        @InjectRepository(FoodItemEntity)
        private readonly itemRepository: Repository<FoodItemEntity>,
        @InjectRepository(FoodCategoryEntity)
        private readonly categoryRepository: Repository<FoodCategoryEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {}

    async listOrders(query: OrderListQueryDto): Promise<PageResultDto<OrderListResponseDto>> {
        const qb = this.orderRepository.createQueryBuilder('o')

        if (query.orderNo) {
            qb.andWhere('o.orderNo LIKE :orderNo', {
                orderNo: `%${query.orderNo}%`,
            })
        }

        if (query.userId !== undefined) {
            qb.andWhere('o.userId = :userId', { userId: query.userId })
        }

        if (query.orderStatus !== undefined) {
            qb.andWhere('o.orderStatus = :orderStatus', {
                orderStatus: query.orderStatus,
            })
        }

        qb.orderBy('o.id', 'DESC')
            .skip((query.pageNum - 1) * query.pageSize)
            .take(query.pageSize)

        const [list, total] = await qb.getManyAndCount()

        return new PageResultDto(
            total,
            query.pageNum,
            query.pageSize,
            list.map((item) => ({
                id: item.id,
                orderNo: item.orderNo,
                userId: item.userId,
                totalAmount: item.totalAmount,
                orderStatus: item.orderStatus,
                remark: item.remark,
                createdAt: item.createdAt,
            })),
        )
    }

    async getOrderDetail(id: number): Promise<OrderDetailResponseDto> {
        const order = await this.orderRepository.findOne({ where: { id } })
        if (!order) {
            throw new BusinessException(BizErrorCode.ORDER_NOT_FOUND, '订单不存在')
        }

        const items = await this.orderItemRepository.find({
            where: { orderId: id },
            order: { id: 'ASC' },
        })

        return {
            id: order.id,
            orderNo: order.orderNo,
            userId: order.userId,
            totalAmount: order.totalAmount,
            orderStatus: order.orderStatus,
            remark: order.remark,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            items: items.map((item) => ({
                id: item.id,
                foodItemId: item.foodItemId,
                foodNameSnapshot: item.foodNameSnapshot,
                priceSnapshot: item.priceSnapshot,
                quantity: item.quantity,
                amount: item.amount,
            })),
        }
    }

    async createCurrentUserOrder(currentUser: CurrentUser, request: CreateOrderDto): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id: currentUser.userId },
        })

        if (!user) {
            throw new BusinessException(BizErrorCode.AUTH_USER_NOT_FOUND, '用户不存在')
        }

        if (user.status !== 1) {
            throw new BusinessException(BizErrorCode.AUTH_USER_DISABLED, '用户已被禁用')
        }

        const mergedItems = this.mergeItems(request)

        await this.dataSource.transaction(async (manager) => {
            const foodItemIds = mergedItems.map((item) => item.foodItemId)
            const foodItems = await manager.find(FoodItemEntity, {
                where: { id: In(foodItemIds) },
            })

            if (foodItems.length !== foodItemIds.length) {
                throw new BusinessException(BizErrorCode.ITEM_NOT_FOUND, '菜品不存在')
            }

            const categoryIds = [...new Set(foodItems.map((item) => item.categoryId))]
            const categories = await manager.find(FoodCategoryEntity, {
                where: { id: In(categoryIds) },
            })

            const categoryMap = new Map(categories.map((item) => [item.id, item]))
            const itemMap = new Map(foodItems.map((item) => [item.id, item]))

            let totalAmount = 0

            for (const reqItem of mergedItems) {
                const foodItem = itemMap.get(reqItem.foodItemId)
                if (!foodItem) {
                    throw new BusinessException(BizErrorCode.ITEM_NOT_FOUND, '菜品不存在')
                }

                if (foodItem.isOnSale !== 1) {
                    throw new BusinessException(BizErrorCode.ITEM_NOT_ON_SALE, '菜品未上架')
                }

                const category = categoryMap.get(foodItem.categoryId)
                if (!category) {
                    throw new BusinessException(BizErrorCode.CATEGORY_NOT_FOUND, '分类不存在')
                }

                if (category.status !== 1) {
                    throw new BusinessException(BizErrorCode.CATEGORY_DISABLED, '分类已停用')
                }

                if (foodItem.stock < reqItem.quantity) {
                    throw new BusinessException(
                        BizErrorCode.ORDER_ITEM_STOCK_NOT_ENOUGH,
                        `菜品库存不足: ${foodItem.name}`,
                    )
                }

                totalAmount += Number(foodItem.price) * reqItem.quantity
            }

            const order = await manager.save(
                FoodOrderEntity,
                manager.create(FoodOrderEntity, {
                    orderNo: this.generateOrderNo(),
                    userId: user.id,
                    totalAmount: totalAmount.toFixed(2),
                    orderStatus: OrderStatus.PENDING_CONFIRM,
                    remark: request.remark ?? null,
                }),
            )

            const orderItems: FoodOrderItemEntity[] = []

            for (const reqItem of mergedItems) {
                const foodItem = itemMap.get(reqItem.foodItemId)!

                foodItem.stock -= reqItem.quantity
                await manager.save(FoodItemEntity, foodItem)

                orderItems.push(
                    manager.create(FoodOrderItemEntity, {
                        orderId: order.id,
                        foodItemId: foodItem.id,
                        foodNameSnapshot: foodItem.name,
                        priceSnapshot: foodItem.price,
                        quantity: reqItem.quantity,
                        amount: (Number(foodItem.price) * reqItem.quantity).toFixed(2),
                    }),
                )
            }

            await manager.save(FoodOrderItemEntity, orderItems)
        })
    }

    async processOrder(request: ProcessOrderDto): Promise<void> {
        const order = await this.mustFindOrder(request.orderId)

        if (order.orderStatus !== OrderStatus.PENDING_CONFIRM) {
            throw new BusinessException(BizErrorCode.ORDER_PROCESS_STATUS_INVALID, '当前订单状态不允许处理')
        }

        order.orderStatus = OrderStatus.PROCESSING
        await this.orderRepository.save(order)
    }

    async finishOrder(request: FinishOrderDto): Promise<void> {
        const order = await this.mustFindOrder(request.orderId)

        if (order.orderStatus !== OrderStatus.PROCESSING) {
            throw new BusinessException(BizErrorCode.ORDER_FINISH_STATUS_INVALID, '当前订单状态不允许完成')
        }

        order.orderStatus = OrderStatus.COMPLETED
        await this.orderRepository.save(order)
    }

    async cancelOrder(request: CancelOrderDto): Promise<void> {
        const order = await this.mustFindOrder(request.orderId)

        if (!([OrderStatus.PENDING_CONFIRM, OrderStatus.PROCESSING] as number[]).includes(order.orderStatus)) {
            throw new BusinessException(BizErrorCode.ORDER_CANCEL_STATUS_INVALID, '当前订单状态不允许取消')
        }

        await this.dataSource.transaction(async (manager) => {
            const orderItems = await manager.find(FoodOrderItemEntity, {
                where: { orderId: order.id },
            })

            const itemIds = orderItems.map((item) => item.foodItemId)
            const foodItems = itemIds.length
                ? await manager.find(FoodItemEntity, {
                      where: { id: In(itemIds) },
                  })
                : []

            const itemMap = new Map(foodItems.map((item) => [item.id, item]))

            for (const orderItem of orderItems) {
                const foodItem = itemMap.get(orderItem.foodItemId)
                if (!foodItem) {
                    throw new BusinessException(BizErrorCode.ITEM_NOT_FOUND, '菜品不存在')
                }

                foodItem.stock += orderItem.quantity
                await manager.save(FoodItemEntity, foodItem)
            }

            order.orderStatus = OrderStatus.CANCELED
            order.remark = request.reason ?? order.remark
            await manager.save(FoodOrderEntity, order)
        })
    }

    async listCurrentUserOrders(
        currentUser: CurrentUser,
        query: OrderListQueryDto,
    ): Promise<PageResultDto<OrderListResponseDto>> {
        return this.listOrders({
            ...query,
            userId: currentUser.userId,
        })
    }

    async getCurrentUserOrderDetail(currentUser: CurrentUser, id: number): Promise<OrderDetailResponseDto> {
        const detail = await this.getOrderDetail(id)
        if (detail.userId !== currentUser.userId) {
            throw new BusinessException(BizErrorCode.ORDER_VIEW_FORBIDDEN, '无权查看他人订单')
        }
        return detail
    }

    async cancelCurrentUserOrder(currentUser: CurrentUser, request: CancelOrderDto): Promise<void> {
        const order = await this.mustFindOrder(request.orderId)
        if (order.userId !== currentUser.userId) {
            throw new BusinessException(BizErrorCode.ORDER_CANCEL_FORBIDDEN, '无权取消他人订单')
        }

        await this.cancelOrder(request)
    }

    async getOrderOverview(query: OrderStatQueryDto): Promise<OrderOverviewResponseDto> {
        const qb = this.orderRepository.createQueryBuilder('o')
        this.applyStatDateRange(qb, query)

        const rows = await qb
            .select('COUNT(*)', 'totalOrderCount')
            .addSelect(
                `SUM(CASE WHEN o.order_status = ${OrderStatus.PENDING_CONFIRM} THEN 1 ELSE 0 END)`,
                'pendingCount',
            )
            .addSelect(`SUM(CASE WHEN o.order_status = ${OrderStatus.PROCESSING} THEN 1 ELSE 0 END)`, 'processingCount')
            .addSelect(`SUM(CASE WHEN o.order_status = ${OrderStatus.COMPLETED} THEN 1 ELSE 0 END)`, 'completedCount')
            .addSelect(`SUM(CASE WHEN o.order_status = ${OrderStatus.CANCELED} THEN 1 ELSE 0 END)`, 'canceledCount')
            .addSelect(
                `COALESCE(SUM(CASE WHEN o.order_status != ${OrderStatus.CANCELED} THEN o.total_amount ELSE 0 END), 0)`,
                'totalAmount',
            )
            .getRawOne<{
                totalOrderCount: string
                pendingCount: string
                processingCount: string
                completedCount: string
                canceledCount: string
                totalAmount: string
            }>()

        return {
            totalOrderCount: Number(rows?.totalOrderCount ?? 0),
            pendingCount: Number(rows?.pendingCount ?? 0),
            processingCount: Number(rows?.processingCount ?? 0),
            completedCount: Number(rows?.completedCount ?? 0),
            canceledCount: Number(rows?.canceledCount ?? 0),
            totalAmount: Number(rows?.totalAmount ?? 0).toFixed(2),
        }
    }

    async getOrderStatusStats(query: OrderStatQueryDto): Promise<OrderStatusStatResponseDto[]> {
        const qb = this.orderRepository.createQueryBuilder('o')
        this.applyStatDateRange(qb, query)

        const rows = await qb
            .select('o.order_status', 'orderStatus')
            .addSelect('COUNT(*)', 'count')
            .groupBy('o.order_status')
            .orderBy('o.order_status', 'ASC')
            .getRawMany<{ orderStatus: string; count: string }>()

        return rows.map((row) => ({
            orderStatus: Number(row.orderStatus),
            count: Number(row.count),
        }))
    }

    async getHotItemStats(query: OrderStatQueryDto): Promise<HotItemStatResponseDto[]> {
        const qb = this.orderItemRepository
            .createQueryBuilder('oi')
            .innerJoin(FoodOrderEntity, 'o', 'o.id = oi.order_id')
            .select('oi.food_item_id', 'foodItemId')
            .addSelect('oi.food_name_snapshot', 'foodName')
            .addSelect('SUM(oi.quantity)', 'totalQuantity')
            .addSelect('SUM(oi.amount)', 'totalAmount')
            .where('o.order_status != :canceled', {
                canceled: OrderStatus.CANCELED,
            })

        if (query.startDate) {
            qb.andWhere('o.created_at >= :startDate', {
                startDate: `${query.startDate} 00:00:00`,
            })
        }

        if (query.endDate) {
            qb.andWhere('o.created_at <= :endDate', {
                endDate: `${query.endDate} 23:59:59`,
            })
        }

        const rows = await qb
            .groupBy('oi.food_item_id')
            .addGroupBy('oi.food_name_snapshot')
            .orderBy('SUM(oi.quantity)', 'DESC')
            .addOrderBy('SUM(oi.amount)', 'DESC')
            .limit(10)
            .getRawMany<{
                foodItemId: string
                foodName: string
                totalQuantity: string
                totalAmount: string
            }>()

        return rows.map((row) => ({
            foodItemId: Number(row.foodItemId),
            foodName: row.foodName,
            totalQuantity: Number(row.totalQuantity),
            totalAmount: Number(row.totalAmount ?? 0).toFixed(2),
        }))
    }

    async getDailyAmountStats(query: OrderStatQueryDto): Promise<DailyAmountStatResponseDto[]> {
        const qb = this.orderRepository
            .createQueryBuilder('o')
            .select('DATE(o.created_at)', 'statDate')
            .addSelect('COUNT(*)', 'orderCount')
            .addSelect(
                `COALESCE(SUM(CASE WHEN o.order_status != ${OrderStatus.CANCELED} THEN o.total_amount ELSE 0 END), 0)`,
                'totalAmount',
            )

        this.applyStatDateRange(qb, query)

        const rows = await qb.groupBy('DATE(o.created_at)').orderBy('DATE(o.created_at)', 'ASC').getRawMany<{
            statDate: string
            orderCount: string
            totalAmount: string
        }>()

        return rows.map((row) => ({
            statDate: row.statDate,
            orderCount: Number(row.orderCount),
            totalAmount: Number(row.totalAmount ?? 0).toFixed(2),
        }))
    }

    private async mustFindOrder(id: number): Promise<FoodOrderEntity> {
        const order = await this.orderRepository.findOne({ where: { id } })
        if (!order) {
            throw new BusinessException(BizErrorCode.ORDER_NOT_FOUND, '订单不存在')
        }
        return order
    }

    private mergeItems(request: CreateOrderDto): Array<{
        foodItemId: number
        quantity: number
    }> {
        const itemMap = new Map<number, number>()

        for (const item of request.items) {
            itemMap.set(item.foodItemId, (itemMap.get(item.foodItemId) ?? 0) + item.quantity)
        }

        return Array.from(itemMap.entries()).map(([foodItemId, quantity]) => ({
            foodItemId,
            quantity,
        }))
    }

    private generateOrderNo(): string {
        const now = new Date()
        const pad = (n: number, l = 2) => String(n).padStart(l, '0')
        return [
            now.getFullYear(),
            pad(now.getMonth() + 1),
            pad(now.getDate()),
            pad(now.getHours()),
            pad(now.getMinutes()),
            pad(now.getSeconds()),
            String(now.getMilliseconds()).padStart(3, '0'),
            Math.floor(Math.random() * 1000)
                .toString()
                .padStart(3, '0'),
        ].join('')
    }

    private applyStatDateRange(
        qb: ReturnType<Repository<FoodOrderEntity>['createQueryBuilder']>,
        query: OrderStatQueryDto,
    ): void {
        if (query.startDate) {
            qb.andWhere('o.created_at >= :startDate', {
                startDate: `${query.startDate} 00:00:00`,
            })
        }

        if (query.endDate) {
            qb.andWhere('o.created_at <= :endDate', {
                endDate: `${query.endDate} 23:59:59`,
            })
        }
    }
}
