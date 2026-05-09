import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDocumentosRequeridos1778363937997 implements MigrationInterface {
    name = 'AddDocumentosRequeridos1778363937997'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ofertas" ADD "documentos_requeridos" jsonb NOT NULL DEFAULT '["CV Base"]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ofertas" DROP COLUMN "documentos_requeridos"`);
    }
}
