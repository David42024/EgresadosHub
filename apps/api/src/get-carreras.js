const { DataSource } = require('typeorm');

const dataSource = new DataSource({
  type: 'postgres',
  url: 'postgresql://postgres:12345@localhost:5432/egresados_db_prueba',
});

async function getCarreras() {
  await dataSource.initialize();
  const carreras = await dataSource.query('SELECT DISTINCT carrera FROM egresados');
  console.log(carreras.map(s => s.carrera).join('\n'));
  process.exit(0);
}

getCarreras();
