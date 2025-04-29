import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { LoggerInterceptor } from './interceptors/logger.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';

const DEFAULT_API_PREFIX = 'api';

async function bootstrap() {
  const PORT = process.env.PORT || 5000;
  const API_PREFIX = process.env.API_PREFIX || DEFAULT_API_PREFIX;
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', true); //Нужно для того, чтобы NestJS понимал, что запросы идут через прокси (nginx). Это говорит Express: «доверяй заголовку X-Forwarded-For и используй его как req.ip».

  app.enableCors({ origin: '*', allowedHeaders: '*' });

  if (process.env.NODE_ENV === 'development') {
    app.setGlobalPrefix(API_PREFIX);
  }

  app.use('/uploads', express.static('./uploads'));

  app.useGlobalInterceptors(new LoggerInterceptor());

  const config = new DocumentBuilder()
    .setTitle("Chopp app's methods description")
    .setDescription('Note, when you need update info')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  if (process.env.NODE_ENV === 'production') {
    // Если у вас есть прокси-сервер (например, Nginx), который перенаправляет запросы на ваш сервер NestJS,
    // вы можете указать базовый URL для Swagger UI, чтобы он правильно отображал ссылки на API.
    document.servers = [
      {
        url: '/api', // Теперь все запросы Swagger будут через /api/
        description: 'Base API URL with Nginx proxy',
      },
    ];
  }

  SwaggerModule.setup(`/docs`, app, document);

  await app.listen(PORT, () => console.log(`server started on port === ${PORT}`));
}

bootstrap();
