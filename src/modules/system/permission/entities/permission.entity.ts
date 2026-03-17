import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'sys_permission' })
export class PermissionEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ name: 'perm_name', type: 'varchar', length: 100 })
    permName: string

    @Column({ name: 'perm_code', type: 'varchar', length: 100, unique: true })
    permCode: string

    @Column({ name: 'status', type: 'int', default: 1 })
    status: number

    @Column({ name: 'remark', type: 'varchar', length: 255, nullable: true })
    remark: string | null

    @CreateDateColumn({ name: 'create_time', type: 'datetime' })
    createTime: Date

    @UpdateDateColumn({ name: 'update_time', type: 'datetime' })
    updateTime: Date
}