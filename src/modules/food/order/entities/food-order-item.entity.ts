import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'food_order_item' })
export class FoodOrderItemEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number

    @Column({ name: 'order_id', type: 'bigint', unsigned: true })
    orderId: number

    @Column({ name: 'food_item_id', type: 'bigint', unsigned: true })
    foodItemId: number

    @Column({ name: 'food_name_snapshot', type: 'varchar', length: 100 })
    foodNameSnapshot: string

    @Column({ name: 'price_snapshot', type: 'decimal', precision: 10, scale: 2 })
    priceSnapshot: string

    @Column({ name: 'quantity', type: 'int' })
    quantity: number

    @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
    amount: string

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date
}
