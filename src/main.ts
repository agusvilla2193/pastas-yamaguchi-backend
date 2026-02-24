import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

/**
 * Configuración compartida entre el bootstrap y los tests E2E.
 * Aquí definimos pipes, filtros, middlewares y CORS.
 */
export function setupApp(app: INestApplication): void {
  // 1. Cookies: Necesario para leer el JWT desde las cookies seguras
  app.use(cookieParser());

  // 2. Filtro Global de Excepciones: Captura errores y evita leaks de info interna
  app.useGlobalFilters(new AllExceptionsFilter());

  // 3. Pipes Globales: Validación automática de DTOs y transformación de tipos
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Elimina campos que no estén en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay campos no permitidos
      transform: true,            // Convierte tipos automáticamente (ej: string a number)
    }),
  );

  // 4. CORS: Configuración de seguridad para el acceso desde el Frontend
  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';

  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });
}

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Aplicamos la configuración compartida
  setupApp(app);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);
  logger.log(`🚀 Dojo Backend corriendo en puerto: ${port}`);
}

void bootstrap();
