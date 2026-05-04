import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService }        from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';

// Detectar si estamos en DigitalOcean (tiene SSL en DATABASE_URL)
const isProduction = process.env.NODE_ENV === 'production';

export const databaseConfig = (config: ConfigService): TypeOrmModuleOptions => {
  const databaseUrl = config.get<string>('DATABASE_URL');

  // Configuración SSL para DigitalOcean Managed Database
  // El certificado es self-signed, necesitamos desactivar la verificación
  const sslConfig = isProduction
    ? { rejectUnauthorized: false, requestCert: true }
    : false;

  return {
    type:     'postgres',
    url:      databaseUrl,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: false,               // NUNCA true en producción
    logging: true,
    ssl: sslConfig,
    extra: {
      max:             20,
      min:             2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    },
  };
};

// DataSource para CLI de TypeORM (migraciones)
export const AppDataSource = new DataSource({
  type:       'postgres',
  url:        process.env.DATABASE_URL,
  entities:   [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  ssl:        process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
} as DataSourceOptions);