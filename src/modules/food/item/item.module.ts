import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FoodCategoryEntity } from '../category/entities/food-category.entity'
import { FoodItemEntity } from './entities/food-item.entity'
import { ItemController } from './item.controller'
import { ItemService } from './item.service'

@Module({
    imports: [TypeOrmModule.forFeature([FoodItemEntity, FoodCategoryEntity])],
    controllers: [ItemController],
    providers: [ItemService],
    exports: [ItemService],
})
export class ItemModule {}
