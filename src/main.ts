import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    const port = process.env.PORT || 3003
    await app.listen(process.env.PORT ?? 3003)

    console.log(`🚀 Server running on http://localhost:${port}`)
    console.log(`📚 Swagger docs on http://localhost:${port}/api-docs`)
}
void bootstrap()
