# Informe de Errores de Linting y Refactorización Tipológica

Este documento resume las lecciones aprendidas y las soluciones aplicadas para eliminar el uso de `any`, corregir accesos inseguros a propiedades y fortalecer el sistema de tipos en el proyecto.

## Resumen de Cambios

### 1. Eliminación de `any` en APIs y Servicios
Se han reemplazado las declaraciones de tipo `any` por tipos inferidos de tRPC o interfaces explícitas.

**Antes:**
```typescript
async create(userId: string, dto: any): Promise<Oferta> {
  const empresa = await this.repo.manager.getRepository('Empresa').findOne({ where: { userId } as any });
  const oferta = this.repo.create({ empresaId: empresa.id, ...dto });
  return this.repo.save(oferta);
}
```

**Después:**
```typescript
async create(userId: string, dto: CreateOfertaDto): Promise<Oferta> {
  const empresa = await this.repo.manager.getRepository('Empresa').findOne({ where: { userId } });
  if (!empresa) throw new NotFoundException('Perfil de empresa no encontrado');
  const oferta = this.repo.create({ empresaId: (empresa as any).id, ...dto });
  return this.repo.save(oferta);
}
```

### 2. Validación de Propiedades Nullish (`strict-boolean-expressions`)
Se han corregido las comprobaciones de veracidad para evitar comportamientos inesperados con valores como `0` o `""`.

**Antes:**
```typescript
if (stats?.total) { ... }
```

**Después:**
```typescript
if (stats !== null && stats.total !== undefined && stats.total > 0) { ... }
```

### 3. Tipado E2E con tRPC en Frontend
Uso sistemático de `RouterOutputs` para garantizar que los datos consumidos coincidan con el contrato del backend.

**Ejemplo:**
```typescript
import type { RouterOutputs } from '@/lib/trpc/router.types';
type Oferta = RouterOutputs['ofertas']['list']['data'][number];

const postulaciones: Postulacion[] = data !== null && typeof data === 'object' && 'data' in data 
  ? (data.data as Postulacion[]) 
  : [];
```

## Errores Comunes y Soluciones

| Categoría | Solución |
| :--- | :--- |
| `@typescript-eslint/no-explicit-any` | Usar `unknown` si el tipo es realmente incierto, o extraer el tipo del contrato tRPC. |
| `@typescript-eslint/no-unsafe-member-access` | Validar la existencia de la propiedad con `in` o comparaciones estrictas contra `null`/`undefined`. |
| `@typescript-eslint/strict-boolean-expressions` | Ser explícito: `val !== undefined` en lugar de `!!val`. |
| `@typescript-eslint/no-floating-promises` | Usar `void` si no se espera el resultado, o `await`/`.then()`. |

## Guía para Nuevas Funcionalidades

1. **Define el contrato primero**: Actualiza `packages/trpc-contract` con Zod schemas precisos.
2. **Evita el cast (`as`)**: Solo úsalo cuando hayas validado el tipo previamente o en integraciones con librerías externas sin tipos.
3. **Usa guardas de tipo**: Crea funciones `isType(val): val is Type` para lógica compleja.
4. **Validación Local**: Antes de hacer push, ejecuta `pnpm run validate-all`.

---
*Documento mantenido por el equipo de ingeniería.*
