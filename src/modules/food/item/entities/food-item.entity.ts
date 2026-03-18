import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'food_item' })
export class FoodItemEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number

    @Column({ name: 'category_id', type: 'bigint', unsigned: true })
    categoryId: number

    @Column({ name: 'name', type: 'varchar', length: 100 })
    name: string

    @Column({ name: 'price', type: 'decimal', precision: 10, scale: 2 })
    price: string

    @Column({ name: 'stock', type: 'int', default: 0 })
    stock: number

    @Column({ name: 'is_on_sale', type: 'tinyint', default: 1 })
    isOnSale: number

    @Column({ name: 'description', type: 'varchar', length: 500, nullable: true })
    description: string | null

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
    updatedAt: Date
}