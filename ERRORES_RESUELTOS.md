# Informe de Errores de Propiedades No Definidas Resueltos

Este informe documenta el proceso de detección y corrección de errores relacionados con accesos a propiedades `undefined` o `null` en tiempo de ejecución, asegurando la robustez del sistema.

## Resumen Ejecutivo
- **Herramientas utilizadas**: ESLint (reglas estrictas), TypeScript (modo estricto), Vitest (tests de seguridad).
- **Archivos analizados**: 100% de la base de código (apps/api, apps/web, packages/trpc-contract).
- **Errores críticos resueltos**: 5+ casos de riesgo de ruptura en producción.
- **Mejora de cobertura**: Implementación de tests de seguridad para casos de borde (datos faltantes).

## Listado de Errores Detectados y Corregidos

### 1. Acceso inseguro a resultados de base de datos (Backend)
- **Ubicación**: [egresados.service.ts](file:///c:/Users/USERJSSV/Documents/UNT%20zzz/7mo%20ciclo/Ing%20Software/TAREA04_Egresados/egresados-platform/apps/api/src/modules/egresados/egresados.service.ts)
- **Causa Raíz**: Uso de desestructuración directa `const [stats] = await repo.query(...)` sin verificar si el array de resultados estaba vacío.
- **Solución**: Se añadió validación de existencia del primer elemento y valores por defecto para evitar `NaN` o `undefined` en el DTO.
- **Prevención**: Regla `@typescript-eslint/no-unsafe-member-access` activada y test unitario de seguridad añadido.

### 2. Validaciones Zod con lógica booleana ambigua
- **Ubicación**: [ofertas.schema.ts](file:///c:/Users/USERJSSV/Documents/UNT%20zzz/7mo%20ciclo/Ing%20Software/TAREA04_Egresados/egresados-platform/packages/trpc-contract/src/schemas/ofertas.schema.ts)
- **Causa Raíz**: Uso de `!d.salarioMin` en refinamientos de Zod. Si el valor era `0` o `undefined`, la lógica podía fallar o ser ambigua.
- **Solución**: Se cambió a comparaciones explícitas `d.salarioMin === undefined`.
- **Prevención**: Regla `@typescript-eslint/strict-boolean-expressions` activada.

### 3. Acceso inseguro a datos de tRPC en Frontend
- **Ubicación**: [ReportesPanel.tsx](file:///c:/Users/USERJSSV/Documents/UNT%20zzz/7mo%20ciclo/Ing%20Software/TAREA04_Egresados/egresados-platform/apps/web/components/dashboard/ReportesPanel.tsx)
- **Causa Raíz**: Acceso directo a `data.url` y `data.jobId` en el callback `onSuccess` de una mutación sin verificar si `data` existía.
- **Solución**: Se implementó validación `data && 'url' in data` y uso de `String()` para asegurar tipos.
- **Prevención**: Creación del hook `useSafeData` para validaciones centralizadas.

### 4. Lógica de renderizado basada en valores nulos (Frontend)
- **Ubicación**: [KpiCard.tsx](file:///c:/Users/USERJSSV/Documents/UNT%20zzz/7mo%20ciclo/Ing%20Software/TAREA04_Egresados/egresados-platform/apps/web/components/dashboard/KpiCard.tsx)
- **Causa Raíz**: Uso de `salarioPromedio && salarioDesviacion` para cálculos. Si uno era `0`, el cálculo no se ejecutaba erróneamente.
- **Solución**: Comparaciones estrictas contra `null`.
- **Prevención**: Tipado exhaustivo de Props y reglas de linting.

### 5. Configuración de TypeScript permisiva
- **Ubicación**: [tsconfig.json (API)](file:///c:/Users/USERJSSV/Documents/UNT%20zzz/7mo%20ciclo/Ing%20Software/TAREA04_Egresados/egresados-platform/apps/api/tsconfig.json)
- **Causa Raíz**: `strictNullChecks` y `noImplicitAny` estaban en `false`.
- **Solución**: Se activó el modo estricto globalmente y se refactorizaron los archivos que fallaban.
- **Impacto**: Se detectaron decenas de errores latentes que ahora son errores de compilación.

### 6. Errores de tipado en componentes de tRPC (Frontend)
- **Ubicación**: [postulaciones/page.tsx](file:///c:/Users/USERJSSV/Documents/UNT%20zzz/7mo%20ciclo/Ing%20Software/TAREA04_Egresados/egresados-platform/apps/web/app/dashboard/egresado/postulaciones/page.tsx), [ReportesPanel.tsx](file:///c:/Users/USERJSSV/Documents/UNT%20zzz/7mo%20ciclo/Ing%20Software/TAREA04_Egresados/egresados-platform/apps/web/components/dashboard/ReportesPanel.tsx)
- **Causa Raíz**: Uso de `any` en iteraciones y falta de tipado explícito en respuestas de tRPC, lo que impedía la detección de propiedades faltantes.
- **Solución**: Se utilizaron los tipos generados `RouterOutputs` para asegurar que las propiedades accedidas existen en el contrato.
- **Impacto**: Se eliminaron accesos a propiedades como `p.oferta?.titulo` que ahora son seguros y verificados por el compilador.

## Conclusión Final
Se ha transformado la base de código de una con múltiples riesgos de runtime a una protegida por tipos estrictos y validaciones defensivas. La integración de `validate-all` en el workflow asegura que la calidad se mantenga en el tiempo.

---
*Informe generado automáticamente por el Asistente de IA el 2026-05-01.*
