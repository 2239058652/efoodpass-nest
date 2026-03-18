import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RoleEntity } from '../role/entities/role.entity'
import { UserEntity } from './entities/user.entity'
import { UserRoleEntity } from './entities/user-role.entity'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { OperationLogModule } from '../operation-log/operation-log.module'

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, UserRoleEntity, RoleEntity]), OperationLogModule],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
