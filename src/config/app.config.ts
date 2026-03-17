import { registerAs } from '@nestjs/config'

export default registerAs('app', () => ({
    port: Number(process.env.PORT ?? 3000),
    appName: process.env.APP_NAME ?? 'EFoodPass Nest',
    swaggerPath: process.env.SWAGGER_PATH ?? 'api-docs',
    globalPrefix: process.env.GLOBAL_PREFIX ?? '',
}))
