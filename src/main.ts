import { Logger, ValidationPipe } from '@nestjs/common'
import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'
import { setupSwagger } from './config/swagger.config'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    const configService = app.get(ConfigService)
    const httpAdapterHost = app.get(HttpAdapterHost)

    const port = configService.get<number>('app.port', 3000)
    const globalPrefix = configService.get<string>('app.globalPrefix', '')
    const swaggerPath = configService.get<string>('app.swaggerPath', 'api-docs')

    if (globalPrefix) {
        app.setGlobalPrefix(globalPrefix)
    }

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: false,
        }),
    )

    app.useGlobalFilters(new GlobalExceptionFilter(httpAdapterHost))
    app.useGlobalInterceptors(new ResponseInterceptor())

    setupSwagger(app, configService)

    await app.listen(port)

    const logger = new Logger('Bootstrap')
    logger.log(`Server running on http://localhost:${port}`)
    logger.log(`Swagger docs on http://localhost:${port}/${swaggerPath}`)
}

void bootstrap()
