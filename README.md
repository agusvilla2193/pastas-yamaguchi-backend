# 🍜 Pastas Yamaguchi - API Enterprise (NestJS)

![Next.js](https://img.shields.io/badge/next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=flat&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)
![Swagger](https://img.shields.io/badge/-Swagger-%23C1E81C?style=flat&logo=swagger&logoColor=black)

Este es el núcleo de la aplicación **Pastas Yamaguchi**. Una solución Full-Stack profesional que integra un Frontend en Next.js y una API en NestJS para gestionar la producción y venta de pastas artesanales, diseñada con arquitectura modular, orquestación de contenedores y carga automatizada de datos.

## 📖 Documentación Interactiva (Swagger)
Una vez que el servidor esté corriendo, puedes explorar y testear todos los endpoints desde la interfaz de Swagger:

🔗 **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

---

## 🛠️ Tecnologías Core
- **Frontend:** [Next.js 15](https://nextjs.org/) con App Router.
- **Framework Backend:** [NestJS](https://nestjs.com/) con arquitectura modular.
- **Base de Datos:** PostgreSQL orquestada en contenedores.
- **Infraestructura:** Docker & Docker Compose (Orquestación de 3 servicios).
- **ORM:** TypeORM con soporte para transacciones atómicas.
- **Seguridad:** JWT + HTTP-Only Cookies & Roles (ADMIN/USER).

## 🚀 Instalación Rápida con Docker (Recomendado)

No necesitas instalar Node.js ni PostgreSQL en tu máquina local.

1. **Configurar el entorno:**
   Asegúrate de tener tus archivos `.env` en las carpetas `backend/` y `frontend/`.

2. **Levantar el sistema completo:**
   ```bash
   docker-compose up --build

3. Cargar catálogo inicial (Seed):
Para inicializar la base de datos con el Administrador y productos de prueba, accede a:
🔗 http://localhost:3000/seed

El backend estará listo en http://localhost:3000 y la DB persistirá sus datos en un volumen.

📋 Características y Avances
🛡️ Seguridad y Robustez

Global Exception Filter: Captura de errores centralizada para evitar fugas de información sensible.

Orquestación Unificada: Frontend, Backend y DB comunicados mediante redes internas de Docker.

Validación Estricta: Uso de ValidationPipe con whitelist para asegurar la integridad de los DTOs.

🛒 Core de Negocio

Sistema de Seeding: Automatización de carga de datos para despliegue inmediato.

Persistencia de Datos: Uso de volúmenes de Docker para mantener la integridad de la DB entre reinicios.

Imágenes: Gestión de archivos mediante Cloudinary.

Mailing: Notificaciones automatizadas con Nodemailer.

🧪 Desarrollo Local (Manual)
Si prefieres correrlo fuera de Docker:

Instalar dependencias: npm install

Modo desarrollo: npm run start:dev

Tests & Coverage: npm run test:cov

Desarrollado con ❤️ para Pastas Yamaguchi.
