import { Injectable } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, In, Repository } from 'typeorm'
import { BizErrorCode } from '../../../common/constants/biz-error-code'
import { OrderStatus } from '../../../common/constants/order.constants'
import { BusinessException } from '../../../common/exceptions/business.exception'
import { PageResultDto } from '../../../shared/page/page-result.dto'
import { OperationLogService } from '../../system/operation-log/operation-log.service'
import { UserEntity } from '../../system/user/entities/user.entity'
import { FoodCategoryEntity } from '../category/entities/food-category.entity'
import { FoodItemEntity } from '../item/entities/food-item.entity'
import { CancelOrderDto } from './dto/cancel-order.dto'
import { CreateOrderDto } from './dto/create-order.dto'
import { FinishOrderDto } from './dto/finish-order.dto'
import { OrderDetailItemResponseDto, OrderDetailResponseDto } from './dto/order-detail-response.dto'
import { OrderItemDto } from './dto/order-item.dto'
import { OrderListQueryDto } from './dto/order-list-query.dto'
import { OrderListResponseDto } from './dto/order-list-response.dto'
import { ProcessOrderDto } from './dto/process-order.dto'
import { FoodOrderEntity } from './entities/food-order.entity'
import { FoodOrderItemEntity } from './entities/food-order-item.entity'

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
        private readonly operationLogService: OperationLogService,
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
        const order = await this.orderRepository.findOne({
            where: { id },
        })
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
            items: items.map<OrderDetailItemResponseDto>((item) => ({
                id: item.id,
                foodItemId: item.foodItemId,
                foodNameSnapshot: item.foodNameSnapshot,
                priceSnapshot: item.priceSnapshot,
                quantity: item.quantity,
                amount: item.amount,
            })),
        }
    }

    async createOrder(request: CreateOrderDto): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id: request.userId },
        })

        if (!user) {
            throw new BusinessException(BizErrorCode.AUTH_USER_NOT_FOUND, '用户不存在')
        }

        if (user.status !== 1) {
            throw new BusinessException(BizErrorCode.AUTH_USER_DISABLED, '用户已被禁用')
        }

        const mergedItems = this.mergeItems(request.items)

        const createdOrder = await this.dataSource.transaction(async (manager) => {
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
            return order
        })

        await this.operationLogService.record({
            userId: request.userId,
            username: user.username,
            module: '订单管理',
            operation: '创建订单',
            requestMethod: 'POST',
            requestUri: '/food/order',
            requestParams: JSON.stringify({
                userId: request.userId,
                itemCount: request.items.length,
                remark: request.remark ?? null,
            }),
            responseData: JSON.stringify({
                orderId: createdOrder.id,
                orderNo: createdOrder.orderNo,
            }),
            status: 1,
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

    async completeOrder(request: FinishOrderDto): Promise<void> {
        const order = await this.mustFindOrder(request.orderId)

        if (order.orderStatus !== OrderStatus.PROCESSING) {
            throw new BusinessException(BizErrorCode.ORDER_COMPLETE_STATUS_INVALID, '当前订单状态不允许完成')
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

        await this.operationLogService.record({
            userId: null,
            username: null,
            module: '订单管理',
            operation: '取消订单',
            requestMethod: 'PUT',
            requestUri: '/food/order/cancel',
            requestParams: JSON.stringify({
                orderId: request.orderId,
                reason: request.reason ?? null,
            }),
            responseData: JSON.stringify({
                orderId: order.id,
                orderNo: order.orderNo,
                orderStatus: OrderStatus.CANCELED,
            }),
            status: 1,
        })
    }

    private async mustFindOrder(id: number): Promise<FoodOrderEntity> {
        const order = await this.orderRepository.findOne({
            where: { id },
        })

        if (!order) {
            throw new BusinessException(BizErrorCode.ORDER_NOT_FOUND, '订单不存在')
        }

        return order
    }

    private mergeItems(items: OrderItemDto[]): Array<{
        foodItemId: number
        quantity: number
    }> {
        const itemMap = new Map<number, number>()

        for (const item of items) {
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
}
