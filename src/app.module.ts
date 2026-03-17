import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // 全局可用，其他模块不用重复导入
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
