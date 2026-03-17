import { INestApplication } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

export function setupSwagger(app: INestApplication, configService: ConfigService): void {
    const appName = configService.get<string>('app.appName', 'EFoodPass Nest')
    const swaggerPath = configService.get<string>('app.swaggerPath', 'api-docs')

    const documentConfig = new DocumentBuilder()
        .setTitle(appName)
        .setDescription(`${appName} API documentation`)
        .setVersion('1.0.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'Authorization',
                in: 'header',
            },
            'bearer',
        )
        .build()

    const document = SwaggerModule.createDocument(app, documentConfig)
    SwaggerModule.setup(swaggerPath, app, document)
}