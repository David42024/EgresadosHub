import 'reflect-metadata';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService }        from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';
// Importar dotenv opcionalmente para el CLI de TypeORM en local
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('dotenv').config();
} catch (error) {
  // Silencioso: en producción dotenv se ignora
}

if (!process.env.DATABASE_URL) {
  console.warn('⚠️ DATABASE_URL no encontrada en process.env. Asegúrate de que el archivo .env existe en apps/api/');
} else {
  console.log('✅ DATABASE_URL cargada correctamente para la migración.');
}

// Configuración SSL para DigitalOcean Managed Database
const isProduction = process.env.NODE_ENV === 'production';

// Set PGSSLMODE para el driver pg subyacente
if (isProduction) {
  process.env.PGSSLMODE = 'no-verify';
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// basePath apunta a 'src' o 'dist' dependiendo del entorno
const isDist = __dirname.includes('dist');
const basePath = typeof __dirname !== 'undefined' ? join(__dirname, '..') : join(process.cwd(), 'src');
const fileExt = isDist ? '*.js' : '*.ts';

export const databaseConfig = (config: ConfigService): TypeOrmModuleOptions => ({
  type:     'postgres',
  url:      config.get<string>('DATABASE_URL'),
  entities: [join(basePath, '**', `*.entity.${fileExt.replace('*.', '')}`)],
  migrations: [join(basePath, 'database', 'migrations', fileExt)],
  synchronize: false,               // NUNCA true en producción
  logging: true,
  // Usar ssl=true con rejectUnauthorized: false en extra
  ssl: isProduction ? true : false,
  extra: {
    ssl: isProduction ? { rejectUnauthorized: false } : null,
    max:             20,
    min:             2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  },
});

// DataSource para CLI de TypeORM (migraciones)
export const AppDataSource = new DataSource({
  type:       'postgres',
  url:        process.env.DATABASE_URL,
  entities:   [join(basePath, '**', `*.entity.${fileExt.replace('*.', '')}`)],
  migrations: [join(basePath, 'database', 'migrations', fileExt)],
  synchronize: false,
  ssl:        process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
} as DataSourceOptions);