import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FoodCategoryEntity } from '../category/entities/food-category.entity'
import { FoodItemEntity } from './entities/food-item.entity'
import { ItemController } from './item.controller'
import { ItemService } from './item.service'
import { OperationLogModule } from '../../system/operation-log/operation-log.module'
import { FoodOrderItemEntity } from '../order/entities/food-order-item.entity'

@Module({
    imports: [TypeOrmModule.forFeature([FoodItemEntity, FoodCategoryEntity, FoodOrderItemEntity]), OperationLogModule],
    controllers: [ItemController],
    providers: [ItemService],
    exports: [ItemService],
})
export class ItemModule {}
