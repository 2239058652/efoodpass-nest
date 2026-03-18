import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CategoryController } from './category.controller'
import { CategoryService } from './category.service'
import { FoodCategoryEntity } from './entities/food-category.entity'

@Module({
    imports: [TypeOrmModule.forFeature([FoodCategoryEntity])],
    controllers: [CategoryController],
    providers: [CategoryService],
    exports: [CategoryService],
})
export class CategoryModule {}
