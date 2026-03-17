import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PermissionController } from './permission.controller'
import { PermissionService } from './permission.service'
import { PermissionEntity } from './entities/permission.entity'

@Module({
    imports: [TypeOrmModule.forFeature([PermissionEntity])],
    controllers: [PermissionController],
    providers: [PermissionService],
    exports: [PermissionService],
})
export class PermissionModule {}
