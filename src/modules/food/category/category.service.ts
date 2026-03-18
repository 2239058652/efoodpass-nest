import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BusinessException } from '../../../common/exceptions/business.exception'
import { PageResultDto } from '../../../shared/page/page-result.dto'
import { CategoryDetailResponseDto } from './dto/category-detail-response.dto'
import { CategoryListQueryDto } from './dto/category-list-query.dto'
import { CategoryListResponseDto } from './dto/category-list-response.dto'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { UpdateCategoryStatusDto } from './dto/update-category-status.dto'
import { FoodCategoryEntity } from './entities/food-category.entity'
import { BizErrorCode } from '../../../common/constants/biz-error-code'

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(FoodCategoryEntity)
        private readonly categoryRepository: Repository<FoodCategoryEntity>,
    ) {}

    async listCategories(query: CategoryListQueryDto): Promise<PageResultDto<CategoryListResponseDto>> {
        const qb = this.categoryRepository.createQueryBuilder('c')

        if (query.name) {
            qb.andWhere('c.name LIKE :name', { name: `%${query.name}%` })
        }

        if (query.status !== undefined) {
            qb.andWhere('c.status = :status', { status: query.status })
        }

        qb.orderBy('c.sortNo', 'ASC')
            .addOrderBy('c.id', 'DESC')
            .skip((query.pageNum - 1) * query.pageSize)
            .take(query.pageSize)

        const [list, total] = await qb.getManyAndCount()

        return new PageResultDto(
            total,
            query.pageNum,
            query.pageSize,
            list.map((item) => ({
                id: item.id,
                name: item.name,
                sortNo: item.sortNo,
                status: item.status,
            })),
        )
    }

    async getCategoryDetail(id: number): Promise<CategoryDetailResponseDto> {
        const category = await this.categoryRepository.findOne({ where: { id } })
        if (!category) {
            throw new BusinessException(BizErrorCode.CATEGORY_NOT_FOUND, '分类不存在')
        }

        return {
            id: category.id,
            name: category.name,
            sortNo: category.sortNo,
            status: category.status,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
        }
    }

    async createCategory(request: CreateCategoryDto): Promise<void> {
        if (![0, 1].includes(request.status)) {
            throw new BusinessException(BizErrorCode.CATEGORY_STATUS_INVALID, '分类状态值不合法')
        }

        const exist = await this.categoryRepository.findOne({
            where: { name: request.name },
        })

        if (exist) {
            throw new BusinessException(BizErrorCode.CATEGORY_NAME_DUPLICATE, '分类名称已存在')
        }

        await this.categoryRepository.save(
            this.categoryRepository.create({
                name: request.name,
                sortNo: request.sortNo ?? 0,
                status: request.status,
            }),
        )
    }

    async updateCategory(request: UpdateCategoryDto): Promise<void> {
        const category = await this.categoryRepository.findOne({
            where: { id: request.id },
        })

        if (!category) {
            throw new BusinessException(BizErrorCode.CATEGORY_NOT_FOUND, '分类不存在')
        }

        if (![0, 1].includes(request.status)) {
            throw new BusinessException(BizErrorCode.CATEGORY_STATUS_INVALID, '分类状态值不合法')
        }

        const sameName = await this.categoryRepository.findOne({
            where: { name: request.name },
        })

        if (sameName && sameName.id !== request.id) {
            throw new BusinessException(BizErrorCode.CATEGORY_NAME_DUPLICATE, '分类名称已存在')
        }

        category.name = request.name
        category.sortNo = request.sortNo ?? 0
        category.status = request.status

        await this.categoryRepository.save(category)
    }

    async updateCategoryStatus(request: UpdateCategoryStatusDto): Promise<void> {
        const category = await this.categoryRepository.findOne({
            where: { id: request.categoryId },
        })

        if (!category) {
            throw new BusinessException(BizErrorCode.CATEGORY_NOT_FOUND, '分类不存在')
        }

        if (![0, 1].includes(request.status)) {
            throw new BusinessException(BizErrorCode.CATEGORY_STATUS_INVALID, '分类状态值不合法')
        }

        category.status = request.status
        await this.categoryRepository.save(category)
    }

    async deleteCategory(id: number): Promise<void> {
        const category = await this.categoryRepository.findOne({ where: { id } })
        if (!category) {
            throw new BusinessException(BizErrorCode.CATEGORY_NOT_FOUND, '分类不存在')
        }

        await this.categoryRepository.delete(id)
    }
}
