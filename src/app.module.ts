import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ConfigModule, ConfigType } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import appConfig from './config/app.config'
import databaseConfig from './config/database.config'
import jwtConfig from './config/jwt.config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { PermissionsGuard } from './common/guards/permissions.guard'
import { AuthModule } from './modules/auth/auth.module'
import { PermissionModule } from './modules/system/permission/permission.module'
import { RoleModule } from './modules/system/role/role.module'
import { UserModule } from './modules/system/user/user.module'
import { CategoryModule } from './modules/food/category/category.module'
import { ItemModule } from './modules/food/item/item.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
            load: [appConfig, databaseConfig, jwtConfig],
        }),
        TypeOrmModule.forRootAsync({
            inject: [databaseConfig.KEY],
            useFactory: (dbConfig: ConfigType<typeof databaseConfig>) => dbConfig,
        }),
        AuthModule,
        UserModule,
        RoleModule,
        PermissionModule,
        CategoryModule,
        ItemModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: PermissionsGuard,
        },
    ],
})
export class AppModule {}
