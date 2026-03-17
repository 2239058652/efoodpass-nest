import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'sys_role_permission' })
export class RolePermissionEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ name: 'role_id', type: 'bigint' })
    roleId: number

    @Column({ name: 'permission_id', type: 'bigint' })
    permissionId: number
}
