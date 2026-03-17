import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'sys_role' })
export class RoleEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ name: 'role_name', type: 'varchar', length: 50 })
    roleName: string

    @Column({ name: 'role_code', type: 'varchar', length: 50, unique: true })
    roleCode: string

    @Column({ name: 'status', type: 'int', default: 1 })
    status: number

    @Column({ name: 'remark', type: 'varchar', length: 255, nullable: true })
    remark: string | null

    @CreateDateColumn({ name: 'create_time', type: 'datetime' })
    createTime: Date

    @UpdateDateColumn({ name: 'update_time', type: 'datetime' })
    updateTime: Date
}