#!/bin/sh
# Script de inicio que ejecuta migraciones antes de iniciar la app

echo "🏃 Ejecutando migraciones de base de datos..."
npx ts-node -P tsconfig.json -r reflect-metadata -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d src/database/data-source.ts

if [ $? -ne 0 ]; then
  echo "❌ Error al ejecutar migraciones"
  exit 1
fi

echo "✅ Migraciones completadas. Iniciando aplicación..."
exec node dist/main
