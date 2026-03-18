import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'food_category' })
export class FoodCategoryEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number

    @Column({ name: 'name', type: 'varchar', length: 50, unique: true })
    name: string

    @Column({ name: 'sort_no', type: 'int', default: 0 })
    sortNo: number

    @Column({ name: 'status', type: 'tinyint', default: 1 })
    status: number

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
    updatedAt: Date
}