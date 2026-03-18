import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common'
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator'
import { CategoryService } from './category.service'
import { CategoryListQueryDto } from './dto/category-list-query.dto'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { UpdateCategoryStatusDto } from './dto/update-category-status.dto'
import { PermissionCode } from '../../../common/constants/permission.constants'

@Controller('food/category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Get('list')
    @RequirePermissions(PermissionCode.FOOD_CATEGORY_LIST)
    async list(@Query() query: CategoryListQueryDto) {
        return this.categoryService.listCategories(query)
    }

    @Get(':id')
    @RequirePermissions(PermissionCode.FOOD_CATEGORY_DETAIL)
    async detail(@Param('id', ParseIntPipe) id: number) {
        return this.categoryService.getCategoryDetail(id)
    }

    @Post()
    @RequirePermissions(PermissionCode.FOOD_CATEGORY_ADD)
    async create(@Body() request: CreateCategoryDto) {
        await this.categoryService.createCategory(request)
        return null
    }

    @Put()
    @RequirePermissions(PermissionCode.FOOD_CATEGORY_UPDATE)
    async update(@Body() request: UpdateCategoryDto) {
        await this.categoryService.updateCategory(request)
        return null
    }

    @Put('status')
    @RequirePermissions(PermissionCode.FOOD_CATEGORY_UPDATE_STATUS)
    async updateStatus(@Body() request: UpdateCategoryStatusDto) {
        await this.categoryService.updateCategoryStatus(request)
        return null
    }

    @Delete(':id')
    @RequirePermissions(PermissionCode.FOOD_CATEGORY_DELETE)
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.categoryService.deleteCategory(id)
        return null
    }
}
