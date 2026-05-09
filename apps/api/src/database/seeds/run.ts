import { DataSource } from 'typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function runSeed() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    await dataSource.initialize();
    console.log('🌱 Conectado a la base de datos para seeding...');

    const seedFile = join(process.cwd(), 'src/database/seeds/seed.sql');
    const sql = readFileSync(seedFile, 'utf8');

    console.log('⏳ Ejecutando seed.sql...');
    await dataSource.query(sql);

    console.log('✅ Seeding completado exitosamente.');
  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runSeed().catch((err) => {
  console.error(err);
  process.exit(1);
});
