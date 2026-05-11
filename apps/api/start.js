#!/usr/bin/env node
/**
 * Script de inicio que ejecuta migraciones antes de iniciar la app
 * Usa archivos compilados (JS) en lugar de TypeScript
 */

const { execSync } = require('child_process');

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
  console.log('✅ Migraciones completadas.');
} catch (error) {
  console.warn('⚠️  Las migraciones fallaron (posiblemente por permisos). Continuando...');
  console.warn('   Para ejecutar manualmente, usa la consola de DigitalOcean:');
  console.warn('   ALTER TABLE users ADD COLUMN github_id VARCHAR(255) NULL;');
}

console.log('🚀 Iniciando aplicación...');
// Iniciar la aplicación
require('./dist/main');
