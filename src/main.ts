import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Habilita el parseo de cookies enviadas por el navegador
  app.use(cookieParser());

  // Configuración estricta de CORS para comunicación puerto a puerto
  app.enableCors({
    origin: 'http://localhost:3001', // URL exacta de tu frontend
    credentials: true, // Permite el intercambio de cookies de sesión
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  // Validaciones globales de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = 3000;
  await app.listen(port);
  logger.log(`🚀 Dojo Backend corriendo en: http://localhost:${port}`);
}

void bootstrap();
