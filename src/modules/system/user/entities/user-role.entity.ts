import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'sys_user_role' })
export class UserRoleEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ name: 'user_id', type: 'bigint' })
    userId: number

    @Column({ name: 'role_id', type: 'bigint' })
    roleId: number
}
