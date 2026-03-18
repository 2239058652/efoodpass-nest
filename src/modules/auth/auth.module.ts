import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './strategies/jwt.strategy'
import { UserEntity } from '../system/user/entities/user.entity'
import { UserRoleEntity } from '../system/user/entities/user-role.entity'
import { RoleEntity } from '../system/role/entities/role.entity'
import { RolePermissionEntity } from '../system/role/entities/role-permission.entity'
import { PermissionEntity } from '../system/permission/entities/permission.entity'
import { OperationLogModule } from '../system/operation-log/operation-log.module'

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, UserRoleEntity, RoleEntity, RolePermissionEntity, PermissionEntity]),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('jwt.secret', ''),
                signOptions: {
                    expiresIn: '7d' as const,
                },
            }),
        }),
        OperationLogModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule {}
