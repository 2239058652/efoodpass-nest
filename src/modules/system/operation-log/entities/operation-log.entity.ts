import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'sys_operation_log' })
export class OperationLogEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number

    @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: true })
    userId: number | null

    @Column({ name: 'username', type: 'varchar', length: 50, nullable: true })
    username: string | null

    @Column({ name: 'module', type: 'varchar', length: 100 })
    module: string

    @Column({ name: 'operation', type: 'varchar', length: 100 })
    operation: string

    @Column({ name: 'request_method', type: 'varchar', length: 10, nullable: true })
    requestMethod: string | null

    @Column({ name: 'request_uri', type: 'varchar', length: 255, nullable: true })
    requestUri: string | null

    @Column({ name: 'request_params', type: 'text', nullable: true })
    requestParams: string | null

    @Column({ name: 'response_data', type: 'text', nullable: true })
    responseData: string | null

    @Column({ name: 'ip_address', type: 'varchar', length: 50, nullable: true })
    ipAddress: string | null

    @Column({ name: 'status', type: 'tinyint', default: 1 })
    status: number

    @Column({ name: 'error_message', type: 'varchar', length: 500, nullable: true })
    errorMessage: string | null

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date
}
