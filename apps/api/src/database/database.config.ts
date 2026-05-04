import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService }        from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';

// Configuración SSL para DigitalOcean Managed Database
// El certificado es self-signed, usamos sslmode=no-verify via env var
// Esto desactiva la verificación del certificado SSL
const isProduction = process.env.NODE_ENV === 'production';

// Set PGSSLMODE para el driver pg subyacente
if (isProduction) {
  process.env.PGSSLMODE = 'no-verify';
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export const databaseConfig = (config: ConfigService): TypeOrmModuleOptions => ({
  type:     'postgres',
  url:      config.get<string>('DATABASE_URL'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
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
  entities:   [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  ssl:        process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
} as DataSourceOptions);