const { DataSource } = require('typeorm');

const dataSource = new DataSource({
  type: 'postgres',
  url: 'postgresql://postgres:12345@localhost:5432/egresados_db_prueba',
});

async function getSectores() {
  await dataSource.initialize();
  const sectores = await dataSource.query('SELECT DISTINCT sector FROM empresas');
  console.log(sectores.map(s => s.sector).join('\n'));
  process.exit(0);
}

getSectores();
