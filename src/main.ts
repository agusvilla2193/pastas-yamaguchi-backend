import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser'; // 1. Importar

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser()); // 2. Usar middleware de cookies

  app.enableCors({
    origin: 'http://localhost:3001', // Tu frontend
    credentials: true, // 3. ¡Vital! Permite el paso de cookies
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  await app.listen(3000);
}
bootstrap();
