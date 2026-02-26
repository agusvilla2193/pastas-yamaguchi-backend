# --- ETAPA 1: Construcción (Build) ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos dependencias (incluye las de desarrollo para poder usar 'nest build')
RUN npm install

# Copiamos el resto del código fuente
COPY . .

# Generamos la carpeta /dist (JavaScript compilado)
RUN npm run build

# --- ETAPA 2: Producción (Runner) ---
FROM node:20-alpine AS runner

WORKDIR /app

# Definimos variables de entorno de producción
ENV NODE_ENV=production

# Copiamos solo lo necesario para ejecutar
COPY package*.json ./
RUN npm install --omit=dev

# Traemos solo la carpeta compilada desde el builder
COPY --from=builder /app/dist ./dist

# Exponemos el puerto 3000
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "dist/main"]
