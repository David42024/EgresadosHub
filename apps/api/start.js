#!/usr/bin/env node
/**
 * Script de inicio que ejecuta migraciones antes de iniciar la app
 * Usa archivos compilados (JS) en lugar de TypeScript
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🏃 Ejecutando migraciones de base de datos...');

try {
  // Ejecutar migraciones usando typeorm con archivos compilados
  execSync(
    'npx typeorm migration:run -d dist/database/data-source.js',
    {
      cwd: process.cwd(),
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' }
    }
  );
  console.log('✅ Migraciones completadas. Iniciando aplicación...');
} catch (error) {
  console.error('❌ Error al ejecutar migraciones:', error.message);
  process.exit(1);
}

// Iniciar la aplicación
require('./dist/main');
