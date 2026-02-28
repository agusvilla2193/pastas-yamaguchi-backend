import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // 1. Importamos Swagger
import * as cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

/**
 * Configuración compartida entre el bootstrap y los tests E2E.
 */
export function setupApp(app: INestApplication): void {
  // 1. Cookies
  app.use(cookieParser());

  // 2. Filtro Global de Excepciones
  app.useGlobalFilters(new AllExceptionsFilter());

  // 3. Pipes Globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 4. Swagger: Configuración de la documentación interactiva
  const config = new DocumentBuilder()
    .setTitle('Pastas Yamaguchi API')
    .setDescription('Documentación oficial del ecosistema de Pastas Yamaguchi. Incluye gestión de productos, órdenes, carrito y pagos.')
    .setVersion('1.0')
    .addBearerAuth() // Habilita el candadito para JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // Acceso en /api/docs

  // 5. CORS
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

  setupApp(app);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);
  logger.log(`🚀 Dojo Backend corriendo en puerto: ${port}`);
  logger.log(`📖 Documentación Swagger disponible en: http://localhost:${port}/api/docs`);
}

void bootstrap();
