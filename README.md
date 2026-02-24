# 🍜 Dojo Yamaguchi - API (NestJS)

![Coverage](https://img.shields.io/badge/coverage-15%25-yellow)
![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=flat&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)

Este es el núcleo de la aplicación **Dojo Yamaguchi**. Una API robusta desarrollada con NestJS para gestionar la producción y venta de pastas artesanales, diseñada con un enfoque en seguridad y escalabilidad.

## 🛠️ Tecnologías Principales
- **Framework:** [NestJS](https://nestjs.com/)
- **Lenguaje:** TypeScript (Strict Mode)
- **Base de Datos:** PostgreSQL
- **ORM:** TypeORM
- **Autenticación:** JWT + HTTP-Only Cookies
- **Pagos:** Mercado Pago SDK
- **Imágenes:** Cloudinary

## 📋 Características y Avances

### 🛡️ Seguridad y Robustez
- **Global Exception Filter:** Sistema centralizado para capturar y formatear errores, evitando filtraciones de datos técnicos del servidor.
- **Data Sanitization:** Los datos sensibles (como passwords y salts) están protegidos y nunca se exponen en las respuestas de la API.
- **Validación Estricta:** Uso de `ValidationPipe` global con `whitelist` para asegurar que solo ingresen los datos permitidos.

### 🛒 Core de Negocio
- **Gestión de Órdenes:** Lógica de stock atómica mediante transacciones de base de datos para evitar inconsistencias.
- **Flujo de Productos:** CRUD completo con validaciones de integridad de stock.
- **Pagos Integrados:** Flujo completo de Checkout Pro y Webhooks de Mercado Pago.
- **Notificaciones:** Envío de correos para confirmación de cuenta y recuperación de contraseña (Nodemailer).



## 🚀 Instalación y Desarrollo

1. **Instalar dependencias:**
   ```bash
   npm install

2. Configurar variables de entorno (.env):
   Crea un archivo .development.env en la raíz con las siguientes claves:

   DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

   JWT_SECRET

   FRONTEND_URL (Ej: http://localhost:3001)

   BACKEND_URL (Ej: http://localhost:3000)

   MP_ACCESS_TOKEN

   CLOUDINARY_URL, MAIL_USER, MAIL_PASS

3. Correr en modo desarrollo:
   ```bash
   npm run start:dev

4. Compilar para producción:
     ```bash
   npm run build

5. Ejecutar Pruebas y Coverage:
     ```bash
   npm run test:cov

Desarrollado con ❤️ para Pastas Yamaguchi.
