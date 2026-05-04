# 🎓 Plataforma de Egresados UNT

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/NestJS-10-ea2845?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS">
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Redis-7-dc382d?style=for-the-badge&logo=redis&logoColor=white" alt="Redis">
  <img src="https://img.shields.io/badge/tRPC-11-2596be?style=for-the-badge" alt="tRPC">
</p>

<p align="center">
  <strong>Sistema integral de gestión de egresados para la Universidad Nacional de Trujillo</strong>
</p>

<p align="center">
  <a href="#-características">Características</a> •
  <a href="#-stack-tecnológico">Stack</a> •
  <a href="#-instalación">Instalación</a> •
  <a href="#-desarrollo">Desarrollo</a> •
  <a href="#-despliegue">Despliegue</a> •
  <a href="#-documentación">Docs</a>
</p>

---

## 📋 Características

### 👨‍🎓 Para Egresados
- 📝 Creación y gestión de perfil profesional
- 🔍 Búsqueda de ofertas laborales por carrera, ubicación y modalidad
- 📨 Postulación a ofertas con carta de presentación
- 📊 Seguimiento de postulaciones (Postulado → Revisión → Entrevista → Contratado)
- 📈 Dashboard personal con métricas de empleabilidad

### 🏢 Para Empresas
- 🏛️ Registro y verificación de empresas
- 📢 Publicación de ofertas laborales con filtros por habilidades
- 👥 Gestión de postulantes (Kanban board)
- 📊 Reportes de efectividad y análisis de candidatos
- 🔍 Búsqueda de egresados por carrera y habilidades

### 🔧 Para Administradores
- 📊 Dashboard analítico con KPIs (egresados, empresas, ofertas, postulaciones)
- 📈 Gráficos de evolución mensual y demanda laboral
- 📄 Generación de reportes PDF (Empleabilidad, Demanda, Ofertas, Egresados)
- ✅ Gestión de verificación de empresas
- 🔔 Sistema de notificaciones

---

## 🛠️ Stack Tecnológico

### Frontend
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **Next.js** | 15.5 | Framework React con App Router |
| **React** | 19 | UI Library |
| **TypeScript** | 5.5 | Tipado estático |
| **Tailwind CSS** | 3.x | Framework CSS utility-first |
| **shadcn/ui** | - | Componentes UI accesibles |
| **tRPC** | 11 | Comunicación type-safe API-Client |
| **TanStack Query** | 5 | Gestión de estado y caché |
| **Recharts** | 2.x | Visualización de datos |
| **Zod** | 3.x | Validación de esquemas |

### Backend
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **NestJS** | 10.x | Framework Node.js modular |
| **PostgreSQL** | 16 | Base de datos relacional |
| **TypeORM** | 0.3.x | ORM para TypeScript |
| **Redis** | 7 | Caché y colas de mensajes |
| **Bull** | 4.x | Gestión de colas de trabajos |
| **tRPC** | 11 | Endpoints type-safe |
| **Passport.js** | - | Autenticación (JWT, Google OAuth) |
| **Puppeteer** | 22.x | Generación de PDFs |
| **Handlebars** | 4.x | Templates HTML para reportes |

### Infraestructura
| Tecnología | Descripción |
|------------|-------------|
| **Docker** | Contenerización |
| **Render** | Plataforma de despliegue |
| **GitHub Actions** | CI/CD |

---

## 📁 Estructura del Proyecto

```
egresados-platform/
├── 📂 apps/
│   ├── 🎨 web/                 # Frontend Next.js
│   │   ├── app/                # App Router
│   │   ├── components/         # Componentes React
│   │   ├── hooks/              # Custom hooks
│   │   └── lib/                # Utilidades y tRPC client
│   │
│   └── ⚙️ api/                 # Backend NestJS
│       ├── src/
│       │   ├── modules/          # Módulos de dominio
│       │   │   ├── auth/         # Autenticación
│       │   │   ├── egresados/    # Gestión de egresados
│       │   │   ├── empresas/     # Gestión de empresas
│       │   │   ├── ofertas/      # Ofertas laborales
│       │   │   ├── postulaciones/# Postulaciones
│       │   │   ├── analytics/     # Análisis y métricas
│       │   │   └── reportes/      # Generación de reportes PDF
│       │   └── database/         # Configuración DB
│       └── storage/pdfs/         # Almacenamiento de PDFs
│
├── 📂 packages/
│   └── 📦 trpc-contract/        # Contratos tRPC compartidos
│       └── src/
│           ├── schemas/           # Esquemas Zod
│           └── types/             # Tipos TypeScript
│
├── 📂 .github/workflows/        # CI/CD con GitHub Actions
├── 🐳 docker-compose.yml       # Desarrollo local con Docker
├── 🚀 render.yaml              # Configuración de despliegue
├── 📝 DEPLOY_RENDER.md         # Guía de despliegue detallada
└── ⚡ turbo.json               # Configuración de Turborepo
```

---

## 🚀 Instalación

### Requisitos Previos
- **Node.js** >= 20.14.0
- **pnpm** >= 9.15.4
- **PostgreSQL** >= 16 (o Docker)
- **Redis** >= 7 (o Docker)

### Opción 1: Docker (Recomendado)

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/egresados-platform.git
cd egresados-platform

# 2. Iniciar servicios
docker-compose up -d

# 3. Ejecutar migraciones y seeds
docker-compose exec api pnpm db:migrate
docker-compose exec api pnpm db:seed

# 4. Acceder
# Web: http://localhost:3000
# API: http://localhost:3001
# Adminer (DB UI): http://localhost:8080
```

### Opción 2: Desarrollo Local

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno
cp apps/api/env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local  # si existe

# 3. Editar apps/api/.env con tus configuraciones:
# - DATABASE_URL
# - REDIS_URL
# - JWT_SECRET
# - etc.

# 4. Ejecutar migraciones
pnpm db:migrate

# 5. Iniciar desarrollo
pnpm dev
```

---

## 💻 Desarrollo

### Comandos Útiles

```bash
# Iniciar todos los servicios en desarrollo
pnpm dev

# Linting y formateo
pnpm lint
pnpm format

# Type checking
pnpm type-check

# Tests
pnpm test              # Unit tests
pnpm test:coverage     # Coverage report
pnpm test:e2e          # E2E tests con Playwright

# Base de datos
pnpm db:migrate        # Ejecutar migraciones
pnpm db:migrate:revert # Revertir última migración
pnpm db:seed           # Cargar datos de prueba

# Construcción
pnpm build             # Build de producción
```

### Estructura de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nueva característica
fix: corrección de bug
docs: documentación
style: cambios de estilo (sin cambio de código)
refactor: refactorización de código
test: tests
chore: tareas de mantenimiento
```

---

## 🌐 Despliegue

### Render.com (Recomendado)

Ver guía detallada en [`DEPLOY_RENDER.md`](./DEPLOY_RENDER.md)

**Resumen rápido:**

1. **Conectar repositorio** en Render Dashboard
2. **Aplicar Blueprint** (`render.yaml`)
3. **Configurar variables** de entorno
4. **Desplegar** vía GitHub Actions o manual

```bash
# Deploy manual con Render CLI
render blueprint apply render.yaml
```

### CI/CD Automático

El workflow de GitHub Actions (`/.github/workflows/ci-cd.yml`) ejecuta:

```
Push a main ──► Quality Checks ──► Build ──► Deploy Render ──► Smoke Tests
     │              (Lint/Test)    (API/Web)   (Automático)    (Health)
```

---

## 📊 Reportes y Análisis

### Tipos de Reportes PDF

| Reporte | Descripción | Generación |
|---------|-------------|------------|
| **Empleabilidad Cohorte** | Tasa de empleabilidad por año y carrera | Síncrona |
| **Demanda Laboral** | Habilidades más demandadas vs egresados | Asíncrona |
| **Listado Egresados** | Padrón completo de egresados | Síncrona |
| **Listado Ofertas** | Historial de ofertas publicadas | Síncrona |
| **Colocación** | Historial de postulaciones y estados | Síncrona |

### KPIs del Dashboard

- Total de egresados registrados
- Total de empresas verificadas
- Ofertas laborales activas
- Postulaciones del mes
- Tasa de empleabilidad global
- Variación mensual de egresados/ofertas
- Salario promedio ofrecido

---

## 🏗️ Arquitectura

### Diagrama de Flujo de Datos

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Cliente   │──────▶│  Next.js    │──────▶│   tRPC      │
│  (Browser)  │◀──────│   (Web)     │◀──────│  (Server)   │
└─────────────┘      └─────────────┘      └──────┬──────┘
                                                  │
                       ┌─────────────┐           │
                       │  PostgreSQL │◀──────────┤
                       │   (Datos)   │           │
                       └─────────────┘           │
                                                  │
                       ┌─────────────┐           │
                       │    Redis    │◀──────────┘
                       │  (Caché/Queue)│
                       └─────────────┘
```

### Seguridad

- ✅ JWT para autenticación stateless
- ✅ Refresh tokens rotativos
- ✅ Google OAuth 2.0
- ✅ Rate limiting (Throttler)
- ✅ Helmet para headers de seguridad
- ✅ CORS configurado
- ✅ Validación de inputs con Zod

---

## 🤝 Contribución

1. **Fork** el repositorio
2. **Crear rama** (`git checkout -b feature/nueva-caracteristica`)
3. **Commit** cambios (`git commit -m 'feat: agregar nueva característica'`)
4. **Push** a la rama (`git push origin feature/nueva-caracteristica`)
5. **Abrir Pull Request**

---

## 📝 Licencia

Este proyecto es desarrollado para la **Universidad Nacional de Trujillo**.

---

## 🆘 Soporte

Si encuentras algún problema:

1. Revisa la [documentación de despliegue](./DEPLOY_RENDER.md)
2. Busca en [Issues existentes](../../issues)
3. Crea un nuevo [Issue](../../issues/new)

---

<p align="center">
  Desarrollado con ❤️ por el equipo de Ingeniería de Software - UNT
</p>
