import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'sys_user' })
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ name: 'username', type: 'varchar', length: 50, unique: true })
    username: string

    @Column({ name: 'password_hash', type: 'varchar', length: 255 })
    passwordHash: string

    @Column({ name: 'nickname', type: 'varchar', length: 50, nullable: true })
    nickname: string | null

    @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
    phone: string | null

    @Column({ name: 'status', type: 'int', default: 1 })
    status: number

    @Column({ name: 'token_version', type: 'int', default: 0 })
    tokenVersion: number

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createTime: Date

    @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
    updateTime: Date
}
