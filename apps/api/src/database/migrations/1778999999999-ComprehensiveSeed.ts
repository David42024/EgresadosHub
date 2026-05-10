import { MigrationInterface, QueryRunner } from "typeorm";
import * as fs from 'fs';
import * as path from 'path';

export class ComprehensiveSeed1778999999999 implements MigrationInterface {
    name = 'ComprehensiveSeed1778999999999'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ejecutar las modificaciones de estructura y el seeder
        const sqlFilePath = path.join(__dirname, '..', 'seeds', 'comprehensive_seed.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');
        
        // El driver de pg en TypeORM puede ejecutar múltiples sentencias separadas por punto y coma.
        await queryRunner.query(sql);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Para revertir, limpiamos la base de datos de los registros generados
        await queryRunner.query(`TRUNCATE users, egresados, empresas, ofertas, postulaciones, postulacion_audit, notificaciones CASCADE;`);
    }
}
