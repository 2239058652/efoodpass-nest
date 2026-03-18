import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common'
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator'
import { AdjustItemStockDto } from './dto/adjust-item-stock.dto'
import { CreateItemDto } from './dto/create-item.dto'
import { ItemListQueryDto } from './dto/item-list-query.dto'
import { UpdateItemOnSaleDto } from './dto/update-item-on-sale.dto'
import { UpdateItemDto } from './dto/update-item.dto'
import { ItemService } from './item.service'

@Controller('food/item')
export class ItemController {
    constructor(private readonly itemService: ItemService) {}

    @Get('list')
    @RequirePermissions('food:item:list')
    async list(@Query() query: ItemListQueryDto) {
        return this.itemService.listItems(query)
    }

    @Get(':id')
    @RequirePermissions('food:item:detail')
    async detail(@Param('id', ParseIntPipe) id: number) {
        return this.itemService.getItemDetail(id)
    }

    @Post()
    @RequirePermissions('food:item:add')
    async create(@Body() request: CreateItemDto) {
        await this.itemService.createItem(request)
        return null
    }

    @Put()
    @RequirePermissions('food:item:update')
    async update(@Body() request: UpdateItemDto) {
        await this.itemService.updateItem(request)
        return null
    }

    @Put('on-sale')
    @RequirePermissions('food:item:update-on-sale')
    async updateOnSale(@Body() request: UpdateItemOnSaleDto) {
        await this.itemService.updateOnSaleStatus(request)
        return null
    }

    @Put('stock')
    @RequirePermissions('food:item:update-stock')
    async adjustStock(@Body() request: AdjustItemStockDto) {
        await this.itemService.adjustStock(request)
        return null
    }

    @Delete(':id')
    @RequirePermissions('food:item:delete')
    async delete(@Param('id', ParseIntPipe) id: number) {
        await this.itemService.deleteItem(id)
        return null
    }
}