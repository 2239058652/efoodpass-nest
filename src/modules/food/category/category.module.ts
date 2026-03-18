import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CategoryController } from './category.controller'
import { CategoryService } from './category.service'
import { FoodCategoryEntity } from './entities/food-category.entity'
import { OperationLogModule } from '../../system/operation-log/operation-log.module'

@Module({
    imports: [TypeOrmModule.forFeature([FoodCategoryEntity]), OperationLogModule],
    controllers: [CategoryController],
    providers: [CategoryService],
    exports: [CategoryService],
})
export class CategoryModule {}
