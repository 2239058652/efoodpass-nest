import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'sys_permission' })
export class PermissionEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number

    @Column({ name: 'parent_id', type: 'bigint', unsigned: true, default: 0 })
    parentId: number

    @Column({ name: 'perm_code', type: 'varchar', length: 100, unique: true })
    permCode: string

    @Column({ name: 'perm_name', type: 'varchar', length: 100 })
    permName: string

    @Column({ name: 'perm_type', type: 'tinyint' })
    permType: number

    @Column({ name: 'path', type: 'varchar', length: 255, nullable: true })
    path: string | null

    @Column({ name: 'method', type: 'varchar', length: 10, nullable: true })
    method: string | null

    @Column({ name: 'sort_no', type: 'int', default: 0 })
    sortNo: number

    @Column({ name: 'status', type: 'tinyint', default: 1 })
    status: number

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
    updatedAt: Date
}
