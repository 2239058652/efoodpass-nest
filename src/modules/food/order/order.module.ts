import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from '../../system/user/entities/user.entity'
import { FoodCategoryEntity } from '../category/entities/food-category.entity'
import { FoodItemEntity } from '../item/entities/food-item.entity'
import { OrderController } from './order.controller'
import { OrderService } from './order.service'
import { FoodOrderEntity } from './entities/food-order.entity'
import { FoodOrderItemEntity } from './entities/food-order-item.entity'
import { OperationLogModule } from '../../system/operation-log/operation-log.module'

@Module({
    imports: [
        TypeOrmModule.forFeature([
            FoodOrderEntity,
            FoodOrderItemEntity,
            FoodItemEntity,
            FoodCategoryEntity,
            UserEntity,
        ]),
        OperationLogModule,
    ],
    controllers: [OrderController],
    providers: [OrderService],
    exports: [OrderService],
})
export class OrderModule {}
