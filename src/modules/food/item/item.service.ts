import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BusinessException } from '../../../common/exceptions/business.exception'
import { PageResultDto } from '../../../shared/page/page-result.dto'
import { FoodCategoryEntity } from '../category/entities/food-category.entity'
import { AdjustItemStockDto } from './dto/adjust-item-stock.dto'
import { CreateItemDto } from './dto/create-item.dto'
import { ItemDetailResponseDto } from './dto/item-detail-response.dto'
import { ItemListQueryDto } from './dto/item-list-query.dto'
import { ItemListResponseDto } from './dto/item-list-response.dto'
import { UpdateItemOnSaleDto } from './dto/update-item-on-sale.dto'
import { UpdateItemDto } from './dto/update-item.dto'
import { FoodItemEntity } from './entities/food-item.entity'
import { BizErrorCode } from '../../../common/constants/biz-error-code'
import { OperationLogService } from '../../system/operation-log/operation-log.service'

@Injectable()
export class ItemService {
    constructor(
        @InjectRepository(FoodItemEntity)
        private readonly itemRepository: Repository<FoodItemEntity>,
        @InjectRepository(FoodCategoryEntity)
        private readonly categoryRepository: Repository<FoodCategoryEntity>,
        private readonly operationLogService: OperationLogService,
    ) {}

    async listItems(query: ItemListQueryDto): Promise<PageResultDto<ItemListResponseDto>> {
        const qb = this.itemRepository
            .createQueryBuilder('i')
            .leftJoin(FoodCategoryEntity, 'c', 'c.id = i.category_id')
            .select([
                'i.id AS id',
                'i.category_id AS categoryId',
                'c.name AS categoryName',
                'i.name AS name',
                'i.price AS price',
                'i.stock AS stock',
                'i.is_on_sale AS isOnSale',
            ])

        if (query.name) {
            qb.andWhere('i.name LIKE :name', { name: `%${query.name}%` })
        }

        if (query.categoryId !== undefined) {
            qb.andWhere('i.category_id = :categoryId', { categoryId: query.categoryId })
        }

        if (query.isOnSale !== undefined) {
            qb.andWhere('i.is_on_sale = :isOnSale', { isOnSale: query.isOnSale })
        }

        qb.orderBy('i.id', 'DESC')
            .offset((query.pageNum - 1) * query.pageSize)
            .limit(query.pageSize)

        const [rows, total] = await Promise.all([qb.getRawMany<ItemListResponseDto>(), this.countItems(query)])

        return new PageResultDto(total, query.pageNum, query.pageSize, rows)
    }

    async getItemDetail(id: number): Promise<ItemDetailResponseDto> {
        const row = await this.itemRepository
            .createQueryBuilder('i')
            .leftJoin(FoodCategoryEntity, 'c', 'c.id = i.category_id')
            .select([
                'i.id AS id',
                'i.category_id AS categoryId',
                'c.name AS categoryName',
                'i.name AS name',
                'i.price AS price',
                'i.stock AS stock',
                'i.is_on_sale AS isOnSale',
                'i.description AS description',
                'i.created_at AS createdAt',
                'i.updated_at AS updatedAt',
            ])
            .where('i.id = :id', { id })
            .getRawOne<ItemDetailResponseDto>()

        if (!row) {
            throw new BusinessException(BizErrorCode.ITEM_NOT_FOUND, '菜品不存在')
        }

        return row
    }

    async createItem(request: CreateItemDto): Promise<void> {
        await this.ensureCategoryUsable(request.categoryId)

        if (![0, 1].includes(request.isOnSale)) {
            throw new BusinessException(BizErrorCode.ITEM_ON_SALE_STATUS_INVALID, '上下架状态值不合法')
        }

        await this.ensureNameUniqueInCategory(request.categoryId, request.name)

        await this.itemRepository.save(
            this.itemRepository.create({
                categoryId: request.categoryId,
                name: request.name,
                price: request.price,
                stock: request.stock,
                isOnSale: request.isOnSale,
                description: request.description ?? null,
            }),
        )
    }

    async updateItem(request: UpdateItemDto): Promise<void> {
        const item = await this.itemRepository.findOne({ where: { id: request.id } })
        if (!item) {
            throw new BusinessException(BizErrorCode.ITEM_NOT_FOUND, '菜品不存在')
        }

        await this.ensureCategoryUsable(request.categoryId)

        if (![0, 1].includes(request.isOnSale)) {
            throw new BusinessException(BizErrorCode.ITEM_ON_SALE_STATUS_INVALID, '上下架状态值不合法')
        }

        await this.ensureNameUniqueInCategory(request.categoryId, request.name, request.id)

        item.categoryId = request.categoryId
        item.name = request.name
        item.price = request.price
        item.stock = request.stock
        item.isOnSale = request.isOnSale
        item.description = request.description ?? null

        await this.itemRepository.save(item)
    }

    async updateOnSaleStatus(request: UpdateItemOnSaleDto): Promise<void> {
        const item = await this.itemRepository.findOne({
            where: { id: request.itemId },
        })

        if (!item) {
            throw new BusinessException(BizErrorCode.ITEM_NOT_FOUND, '菜品不存在')
        }

        if (![0, 1].includes(request.isOnSale)) {
            throw new BusinessException(BizErrorCode.ITEM_ON_SALE_STATUS_INVALID, '上下架状态值不合法')
        }

        if (request.isOnSale === 1) {
            await this.ensureCategoryUsable(item.categoryId)
        }

        item.isOnSale = request.isOnSale
        await this.itemRepository.save(item)
    }

    async adjustStock(request: AdjustItemStockDto): Promise<void> {
        const item = await this.itemRepository.findOne({
            where: { id: request.itemId },
        })

        if (!item) {
            throw new BusinessException(BizErrorCode.ITEM_NOT_FOUND, '菜品不存在')
        }

        const nextStock = item.stock + request.deltaStock
        if (nextStock < 0) {
            throw new BusinessException(BizErrorCode.ITEM_STOCK_INVALID, '库存不能小于0')
        }

        item.stock = nextStock
        await this.itemRepository.save(item)
        await this.operationLogService.record({
            userId: null,
            username: null,
            module: '菜品管理',
            operation: '调整库存',
            requestMethod: 'PUT',
            requestUri: '/food/item/stock',
            requestParams: JSON.stringify({
                itemId: request.itemId,
                deltaStock: request.deltaStock,
            }),
            responseData: JSON.stringify({
                itemId: item.id,
                itemName: item.name,
                currentStock: item.stock,
            }),
            status: 1,
        })
    }

    async deleteItem(id: number): Promise<void> {
        const item = await this.itemRepository.findOne({ where: { id } })
        if (!item) {
            throw new BusinessException(BizErrorCode.ITEM_NOT_FOUND, '菜品不存在')
        }

        await this.itemRepository.delete(id)
    }

    private async ensureCategoryUsable(categoryId: number): Promise<void> {
        const category = await this.categoryRepository.findOne({
            where: { id: categoryId },
        })

        if (!category) {
            throw new BusinessException(BizErrorCode.CATEGORY_NOT_FOUND, '分类不存在')
        }

        if (category.status !== 1) {
            throw new BusinessException(BizErrorCode.CATEGORY_DISABLED, '分类已停用')
        }
    }

    private async ensureNameUniqueInCategory(categoryId: number, name: string, excludeId?: number): Promise<void> {
        const exist = await this.itemRepository.findOne({
            where: { categoryId, name },
        })

        if (exist && exist.id !== excludeId) {
            throw new BusinessException(BizErrorCode.ITEM_NAME_DUPLICATE, '同分类下菜品名称已存在')
        }
    }

    private async countItems(query: ItemListQueryDto): Promise<number> {
        const qb = this.itemRepository.createQueryBuilder('i')

        if (query.name) {
            qb.andWhere('i.name LIKE :name', { name: `%${query.name}%` })
        }

        if (query.categoryId !== undefined) {
            qb.andWhere('i.category_id = :categoryId', { categoryId: query.categoryId })
        }

        if (query.isOnSale !== undefined) {
            qb.andWhere('i.is_on_sale = :isOnSale', { isOnSale: query.isOnSale })
        }

        return qb.getCount()
    }
}
