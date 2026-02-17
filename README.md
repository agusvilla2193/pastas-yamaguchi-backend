# 🍜 Dojo Yamaguchi - API (NestJS)

Este es el núcleo de la aplicación **Dojo Yamaguchi**. Una API robusta desarrollada con NestJS para gestionar la producción y venta de pastas artesanales.

## 🛠️ Tecnologías Principales
- **Framework:** [NestJS](https://nestjs.com/)
- **Lenguaje:** TypeScript (Strict Mode)
- **Base de Datos:** PostgreSQL
- **ORM:** TypeORM
- **Autenticación:** JWT + HTTP-Only Cookies
- **Pagos:** Mercado Pago SDK
- **Imágenes:** Cloudinary

## 📋 Características
- 🛡️ **Autenticación Segura:** Sistema de login y registro con cookies protegidas.
- 🛒 **Gestión de Órdenes:** Lógica de stock atómica mediante transacciones de base de datos.
- 💳 **Pagos Integrados:** Flujo completo de Checkout Pro y Webhooks de Mercado Pago.
- 📧 **Notificaciones:** Envío de correos para confirmación de cuenta y recuperación de contraseña.

## 🚀 Instalación y Desarrollo

1. Instalar dependencias:
   ```bash
   npm install

2. Configurar variables de entorno (.env):
   Crea un archivo .env en la raíz con las siguientes claves:

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
