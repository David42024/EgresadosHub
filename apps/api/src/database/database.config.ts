import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService }        from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';

export const databaseConfig = (config: ConfigService): TypeOrmModuleOptions => ({
  type:     'postgres',
  url:      config.get<string>('DATABASE_URL'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,               // NUNCA true en producción
  logging: true,
  ssl:      config.get('NODE_ENV') === 'production'
    ? { rejectUnauthorized: false }
    : false,
  extra: {
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
} as DataSourceOptions);