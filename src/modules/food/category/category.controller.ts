import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common'
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator'
import { CategoryService } from './category.service'
import { CategoryListQueryDto } from './dto/category-list-query.dto'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { UpdateCategoryStatusDto } from './dto/update-category-status.dto'

@Controller('food/category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Get('list')
    @RequirePermissions('food:category:list')
    async list(@Query() query: CategoryListQueryDto) {
        return this.categoryService.listCategories(query)
    }

    @Get(':id')
    @RequirePermissions('food:category:detail')
    async detail(@Param('id', ParseIntPipe) id: number) {
        return this.categoryService.getCategoryDetail(id)
    }

    @Post()
    @RequirePermissions('food:category:add')
    async create(@Body() request: CreateCategoryDto) {
        await this.categoryService.createCategory(request)
        return null
    }

    @Put()
    @RequirePermissions('food:category:update')
    async update(@Body() request: UpdateCategoryDto) {
        await this.categoryService.updateCategory(request)
        return null
    }

    @Put('status')
    @RequirePermissions('food:category:update-status')
    async updateStatus(@Body() request: UpdateCategoryStatusDto) {
        await this.categoryService.updateCategoryStatus(request)
        return null
    }

    @Delete(':id')
    @RequirePermissions('food:category:delete')
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.categoryService.deleteCategory(id)
        return null
    }
}