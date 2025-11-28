# Etapa 1: build
FROM node:20-alpine AS build

WORKDIR /app

# Permite pasar las vars de Vite en tiempo de build
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Estas ENV hacen que Vite vea las VITE_* dentro del contenedor
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Instala dependencias
COPY package*.json ./
RUN npm ci

# Copia el resto del código y construye
COPY . .
RUN npm run build

# Etapa 2: runtime (servidor estático)
FROM node:20-alpine AS runtime

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

ENV PORT=10000
EXPOSE 10000

CMD ["sh", "-c", "serve -s dist -l ${PORT}"]
