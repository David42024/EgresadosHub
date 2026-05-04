# 🚀 Guía de Deploy en Render.com

Esta guía explica paso a paso cómo deployar la aplicación Egresados UNT en Render.com usando el CI/CD configurado.

---

## 📋 Requisitos Previos

1. Cuenta en [Render.com](https://render.com) (gratuita o de pago)
2. Cuenta en [GitHub](https://github.com)
3. Repositorio del proyecto subido a GitHub

---

## 🔧 Paso 1: Configurar Variables de Entorno en GitHub

Ve a tu repositorio en GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Nombre | Descripción | Valor |
|--------|-------------|-------|
| `RENDER_API_KEY` | API key de Render | Obtener de: Render Dashboard → Account Settings → API Keys |
| `RENDER_SERVICE_ID_API` | ID del servicio API | Lo veremos en el Paso 3 |
| `RENDER_SERVICE_ID_WEB` | ID del servicio Web | Lo veremos en el Paso 3 |
| `RENDER_API_URL` | URL del API | ej: `egresados-api.onrender.com` |
| `RENDER_WEB_URL` | URL del Web | ej: `egresados-web.onrender.com` |

---

## 🐳 Paso 2: Deploy Inicial usando Blueprint (Infraestructura)

### Opción A: Usando Render Dashboard (Recomendado)

1. Ve al [Render Dashboard](https://dashboard.render.com)
2. Haz clic en **"New"** → **"Blueprint"**
3. Conecta tu repositorio de GitHub
4. Render detectará automáticamente el archivo `render.yaml`
5. Revisa los servicios que se crearán:
   - PostgreSQL database
   - Redis instance
   - API (NestJS)
   - Web (Next.js)
6. Haz clic en **"Apply"**

### Opción B: Usando CLI de Render

```bash
# Instalar Render CLI
curl -fsSL https://render.com/install.sh | bash

# Login
render login

# Aplicar blueprint
cd tu-repositorio
render blueprint apply render.yaml
```

---

## 🔑 Paso 3: Obtener IDs de Servicios

Después del deploy inicial:

1. Ve al [Render Dashboard](https://dashboard.render.com)
2. Abre el servicio **egresados-api**
3. En la URL del navegador, copia el ID:
   - URL: `https://dashboard.render.com/web/srv-xxxxxxxxxxxxxxxxxxxxx`
   - ID: `srv-xxxxxxxxxxxxxxxxxxxxx`
4. Guarda como `RENDER_SERVICE_ID_API` en GitHub Secrets
5. Repite para el servicio **egresados-web** → `RENDER_SERVICE_ID_WEB`

---

## 🗄️ Paso 4: Configurar Base de Datos

### 4.1 Ejecutar Migraciones

```bash
# Usando Render CLI
render run egresados-api -- npm run db:migrate

# O desde el dashboard:
# 1. Ve a egresados-api → Shell
# 2. Ejecuta: npm run db:migrate
```

### 4.2 Ejecutar Seeds (Datos iniciales)

```bash
render run egresados-api -- npm run db:seed
```

---

## 🔐 Paso 5: Variables de Entorno Adicionales (Opcional)

En el Dashboard de Render, configura estas variables si son necesarias:

### Servicio API (`egresados-api`)

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `GOOGLE_CLIENT_ID` | *tu-client-id* | Para OAuth de Google |
| `GOOGLE_CLIENT_SECRET` | *tu-secret* | Para OAuth de Google |
| `EMAIL_HOST` | smtp.gmail.com | Servidor SMTP |
| `EMAIL_USER` | *tu-email* | Email para notificaciones |
| `EMAIL_PASSWORD` | *tu-password* | Contraseña de app |
| `CLOUDINARY_CLOUD_NAME` | *tu-cloud* | Para subida de imágenes |
| `CLOUDINARY_API_KEY` | *tu-key* | API Key Cloudinary |
| `CLOUDINARY_API_SECRET` | *tu-secret* | API Secret Cloudinary |

### Servicio Web (`egresados-web`)

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | URL de tu API (https://egresados-api.onrender.com) |

---

## 🔄 Paso 6: Cómo funciona el CI/CD

### Flujo automático:

1. **Push a `main`/`master`** → Se activa el workflow de GitHub Actions
2. **Quality Checks** → Lint, Type Check, Tests
3. **Build** → Compila API y Web
4. **Deploy** → Dispara deploy en Render via API
5. **Smoke Tests** → Verifica que todo funcione

### Estados del deploy:

```
[Push] → [Quality] → [Build] → [Deploy] → [Smoke Tests]
  ✅       ✅          ✅        ✅          ✅
```

---

## 📊 Monitoreo y Logs

### Ver logs en Render Dashboard:

1. Ve al servicio (api o web)
2. Haz clic en **"Logs"**
3. Selecciona el deploy reciente

### Ver logs desde terminal:

```bash
render logs egresados-api
render logs egresados-web
```

---

## 🛠️ Solución de Problemas Comunes

### Error: "Out of memory" en build

**Solución**: Actualiza a plan Starter ($7/mes) o aumenta el tamaño del build:

```yaml
# En render.yaml, agregar al servicio:
buildCommand: NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Error: Puppeteer no encuentra Chrome

**Solución**: Ya está configurado en el Dockerfile. Si persiste:

```bash
# SSH al servicio y verificar
render ssh egresados-api
which chromium-browser
```

### Error: "Cannot connect to database"

**Solución**: Verifica que la base de datos esté corriendo:

```bash
render ps egresados-postgres
```

### CORS errors en producción

**Solución**: Verifica `NEXT_PUBLIC_API_URL` y `API_INTERNAL_URL` estén configuradas correctamente.

---

## 💰 Costos Estimados en Render

| Servicio | Plan | Costo Mensual |
|----------|------|---------------|
| PostgreSQL | Starter | $7 |
| Redis | Starter | $0 (incluido con web service) |
| API (Web Service) | Starter | $7 |
| Web (Web Service) | Starter | $7 |
| **TOTAL** | | **~$21/mes** |

Para desarrollo, puedes usar el plan **Free** con limitaciones:
- Servicios se duermen después de 15 min de inactividad
- Base de datos limitada a 90 días

---

## 📝 Comandos Útiles

```bash
# Ver estado de servicios
render ps

# Reiniciar un servicio
render restart egresados-api

# Ejecutar comando en el servicio
render run egresados-api -- node -e "console.log('test')"

# Shell interactivo
render ssh egresados-api

# Ver variables de entorno
render env egresados-api

# Actualizar una variable
render env set egresados-api JWT_SECRET=nuevo-valor
```

---

## 🔗 URLs Importantes

| Recurso | URL |
|---------|-----|
| Render Dashboard | https://dashboard.render.com |
| Render API Docs | https://render.com/docs/api |
| Blueprint Spec | https://render.com/docs/blueprint-spec |

---

## ✅ Checklist Final

Antes de considerar el deploy completo:

- [ ] Variables de entorno configuradas en GitHub Secrets
- [ ] Blueprint aplicado en Render
- [ ] Base de datos migrada
- [ ] Seeds ejecutados
- [ ] OAuth configurado (opcional)
- [ ] Email configurado (opcional)
- [ ] Cloudinary configurado (opcional)
- [ ] CI/CD funcionando (green check en GitHub)
- [ ] Health checks pasando
- [ ] Dominio personalizado (opcional)

---

¿Necesitas ayuda con algún paso específico? ¡Abre un issue en el repositorio!
