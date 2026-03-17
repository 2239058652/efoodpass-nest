import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PermissionEntity } from '../permission/entities/permission.entity'
import { RoleController } from './role.controller'
import { RoleService } from './role.service'
import { RoleEntity } from './entities/role.entity'
import { RolePermissionEntity } from './entities/role-permission.entity'

@Module({
    imports: [TypeOrmModule.forFeature([RoleEntity, RolePermissionEntity, PermissionEntity])],
    controllers: [RoleController],
    providers: [RoleService],
    exports: [RoleService],
})
export class RoleModule {}
