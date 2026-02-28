# 🍜 Pastas Yamaguchi - API Enterprise (NestJS)

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=flat&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)
![Swagger](https://img.shields.io/badge/-Swagger-%23C1E81C?style=flat&logo=swagger&logoColor=black)

Este es el núcleo de la aplicación **Pastas Yamaguchi**. Una API profesional desarrollada con NestJS para gestionar la producción y venta de pastas artesanales, diseñada con arquitectura modular, contenedores y documentación interactiva.

## 📖 Documentación Interactiva (Swagger)
Una vez que el servidor esté corriendo, puedes explorar y testear todos los endpoints desde la interfaz de Swagger:

🔗 **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

---

## 🛠️ Tecnologías Core
- **Framework:** [NestJS](https://nestjs.com/) con arquitectura modular.
- **Base de Datos:** PostgreSQL orquestada en contenedores.
- **Infraestructura:** Docker & Docker Compose (Multi-stage builds).
- **ORM:** TypeORM con soporte para transacciones atómicas.
- **Pagos:** Mercado Pago SDK (Checkout Pro & Webhooks).
- **Seguridad:** JWT + HTTP-Only Cookies & Bcrypt.

## 🚀 Instalación Rápida con Docker (Recomendado)

No necesitas instalar Node.js ni PostgreSQL en tu máquina local.

1. **Configurar el entorno:**
   Crea un archivo `.development.env` en la raíz (usa `.env.example` como guía).

2. **Levantar el sistema:**
   ```bash
   docker-compose up --build

El backend estará listo en http://localhost:3000 y la DB persistirá sus datos en un volumen.

📋 Características y Avances
🛡️ Seguridad y Robustez
Global Exception Filter: Captura de errores centralizada para evitar fugas de información sensible.

Arquitectura Dockerizada: Imagen de producción optimizada (Alpine Linux) para máxima seguridad y ligereza.

Validación Estricta: Uso de ValidationPipe con whitelist para asegurar la integridad de los DTOs.

🛒 Core de Negocio
Gestión de Stock: Lógica atómica para evitar inconsistencias durante compras simultáneas.

Integración con Mercado Pago: Flujo completo de pagos y recepción de notificaciones IPN/Webhooks.

Imágenes: Gestión de archivos mediante Cloudinary.

Mailing: Notificaciones automatizadas con Nodemailer para recuperación de cuentas.

🧪 Desarrollo Local (Manual)
Si prefieres correrlo fuera de Docker:

Instalar dependencias: npm install

Modo desarrollo: npm run start:dev

Tests & Coverage: npm run test:cov

Desarrollado con ❤️ para Pastas Yamaguchi.
