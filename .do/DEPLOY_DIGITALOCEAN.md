# 🚀 Guía de Deploy en DigitalOcean App Platform

Guía completa para migrar desde Render a DigitalOcean App Platform.

---

## 📋 Estructura del Proyecto

```
egresados-platform/
├── .do/
│   ├── app.yaml              # Especificación de infraestructura
│   └── DEPLOY_DIGITALOCEAN.md # Esta guía
├── apps/
│   ├── api/                   # Backend NestJS
│   │   ├── package.json
│   │   └── src/
│   └── web/                   # Frontend Next.js
│       ├── package.json
│       └── src/
└── package.json               # Root del monorepo
```

---

## 🔧 Paso 1: Configurar Archivos de Deploy

### 1.1 Verificar `app.yaml`

El archivo `.do/app.yaml` ya está configurado con:
- **PostgreSQL**: Base de datos gestionada por DigitalOcean
- **API (NestJS)**: Servicio Node.js con puerto 3001
- **Web (Next.js)**: Servicio Node.js con puerto 3000

### 1.2 Verificar Scripts en `package.json`

#### Backend (`apps/api/package.json`)

```json
{
  "scripts": {
    "build": "nest build",
    "start": "node dist/main",
    "start:prod": "node dist/main"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

#### Frontend (`apps/web/package.json`)

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start -p ${PORT:-3000}",
    "start:prod": "next start"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

---

## 🚀 Paso 2: Deploy en DigitalOcean

### Opción A: Dashboard Web (Recomendado)

1. Ve a [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Haz clic en **"Create App"**
3. Selecciona **GitHub** y conecta tu repositorio
4. Selecciona el repositorio `David42024/EgresadosHub`
5. Selecciona la rama `main`
6. DigitalOcean detectará automáticamente el archivo `.do/app.yaml`
7. Revisa la configuración:
   - Verifica que se detecten 2 servicios (API y Web)
   - Verifica la base de datos PostgreSQL
8. Configura variables de entorno adicionales si es necesario:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
9. Haz clic en **"Create Resources"**

### Opción B: CLI (doctl)

```bash
# Instalar doctl
brew install doctl  # macOS
# o
curl -sL https://github.com/digitalocean/doctl/releases/latest | tar -xzv

# Autenticar
doctl auth init --access-token <tu-token>

# Crear la app
doctl apps create --spec .do/app.yaml
```

---

## 🔐 Paso 3: Variables de Entorno

### Variables Generadas Automáticamente

DigitalOcean genera automáticamente:
- `DATABASE_URL`: URL de conexión a PostgreSQL
- `APP_URL`: URL del frontend
- `egresados-api.PUBLIC_URL`: URL pública del API

### Variables a Configurar Manualmente (Opcional)

Ve a la app en el Dashboard → **Settings** → **App-Level Environment Variables**:

| Variable | Servicio | Descripción |
|----------|----------|-------------|
| `CLOUDINARY_CLOUD_NAME` | API | Nombre del cloud en Cloudinary |
| `CLOUDINARY_API_KEY` | API | API Key de Cloudinary |
| `CLOUDINARY_API_SECRET` | API | API Secret de Cloudinary |
| `EMAIL_HOST` | API | Servidor SMTP |
| `EMAIL_USER` | API | Email para notificaciones |
| `EMAIL_PASSWORD` | API | Contraseña del email |

---

## 🗄️ Paso 4: Migraciones de Base de Datos

Después del primer deploy:

```bash
# Usando la consola de DigitalOcean
doctl apps exec <app-id> -- egresados-api -- npm run db:migrate

# O desde el Dashboard:
# 1. Ve al servicio egresados-api
# 2. Haz clic en "Console"
# 3. Ejecuta: npm run db:migrate
```

### Seeds de Datos

```bash
doctl apps exec <app-id> -- egresados-api -- npm run db:seed
```

---

## 🔄 Conexión Frontend ↔ Backend

### Interna (entre servicios)

DigitalOcean crea una red privada entre servicios:

```yaml
# Frontend puede llamar al backend internamente:
API_INTERNAL_URL: http://egresados-api:3001
```

### Externa (desde navegador)

```yaml
# Frontend usa la URL pública del API:
NEXT_PUBLIC_API_URL: ${egresados-api.PUBLIC_URL}
```

### CORS Configuration

El backend usa `CORS_ORIGIN=${APP_URL}` para permitir solo el frontend.

---

## 🛡️ Recomendaciones de Producción

### 1. Escalado

Para producción, actualiza `app.yaml`:

```yaml
instance_size_slug: basic-xs  # o basic-s para más recursos
instance_count: 2  # Múltiples instancias para alta disponibilidad
```

### 2. Base de Datos

Cambia el plan de PostgreSQL:

```yaml
size: db-s-1vcpu-1gb  # Producción mínimo recomendado
```

### 3. Health Checks

El API ya tiene configurado:
- Path: `/health`
- Timeout: 10 segundos

Asegúrate de tener un endpoint `/health` en tu API:

```typescript
// apps/api/src/health.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
```

### 4. Logs y Monitoreo

- **Logs**: Dashboard → App → Service → Runtime Logs
- **Métricas**: DigitalOcean incluye métricas básicas de CPU/memoria
- **Alertas**: Configuradas automáticamente para deployment failures

### 5. HTTPS y Dominio Personalizado

DigitalOcean proporciona HTTPS automático para:
- Dominio `*.ondigitalocean.app`
- Dominios personalizados (configurar en Dashboard → Domains)

### 6. Límites del Plan Básico

| Recurso | Límite |
|---------|--------|
| CPU | 0.5 vCPU (basic-xxs) |
| RAM | 512 MB (basic-xxs) |
| Bandwidth | 100 GB/mes |
| Build | 100 horas/mes |

Para producción, considera **basic-xs** o **basic-s**.

---

## 💰 Costos Estimados

| Servicio | Plan | Costo Mensual |
|----------|------|---------------|
| PostgreSQL | db-s-dev-database | ~$7 |
| API | basic-xxs | $0 (primeros 3 static sites + 3 servicios gratis) |
| Web | basic-xxs | $0 |
| **TOTAL** | | **~$7/mes** |

Después de los límites gratuitos: ~$24/mes para producción.

---

## 🛠️ Solución de Problemas

### Error: "Cannot find module"

Si el build falla por módulos no encontrados:

```bash
# Asegúrate de que el package.json root tenga:
{
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "build": "turbo build"
  }
}
```

### Error: "Port already in use"

DigitalOcean asigna el puerto automáticamente. Usa:

```typescript
// Backend
const port = process.env['PORT'] || 3001;

// Frontend (next.config.js)
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env['API_INTERNAL_URL']}/api/:path*`,
      },
    ];
  },
};
```

### Error: CORS

Verifica que `CORS_ORIGIN` coincida con la URL del frontend exactamente (incluyendo `https://`).

---

## 📞 Comandos Útiles

```bash
# Ver apps
doctl apps list

# Ver logs
doctl apps logs <app-id> --follow

# Ejecutar comando en contenedor
doctl apps exec <app-id> -- egresados-api -- sh

# Reiniciar servicio
doctl apps restart <app-id> --service egresados-api

# Actualizar variables de entorno
doctl apps update <app-id> --env-var KEY=value
```

---

## ✅ Checklist Final

- [ ] Archivo `.do/app.yaml` creado
- [ ] Repositorio en GitHub con código actualizado
- [ ] Variables de entorno configuradas en Dashboard
- [ ] Primer deploy exitoso
- [ ] Migraciones ejecutadas
- [ ] Seeds ejecutados (si aplica)
- [ ] Health endpoint funcionando
- [ ] CORS configurado correctamente
- [ ] Dominio personalizado (opcional)

---

## 🔗 Recursos

- [DigitalOcean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [doctl CLI Reference](https://docs.digitalocean.com/reference/doctl/)
- [App Spec Reference](https://docs.digitalocean.com/products/app-platform/reference/app-spec/)

¿Necesitas ayuda con algún paso específico?
