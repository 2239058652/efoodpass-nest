import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { OrderStatus } from '../../../../common/constants/order.constants'

@Entity({ name: 'food_order' })
export class FoodOrderEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number

    @Column({ name: 'order_no', type: 'varchar', length: 32, unique: true })
    orderNo: string

    @Column({ name: 'user_id', type: 'bigint', unsigned: true })
    userId: number

    @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
    totalAmount: string

    @Column({ name: 'order_status', type: 'tinyint', default: OrderStatus.PENDING_CONFIRM })
    orderStatus: (typeof OrderStatus)[keyof typeof OrderStatus]

    @Column({ name: 'remark', type: 'varchar', length: 300, nullable: true })
    remark: string | null

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
    updatedAt: Date
}
