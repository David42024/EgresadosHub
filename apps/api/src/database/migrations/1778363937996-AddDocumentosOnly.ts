import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDocumentosOnly1778363937996 implements MigrationInterface {
    name = 'AddDocumentosOnly1778363937996'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "postulaciones" ADD "documentos" jsonb DEFAULT '[]'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "postulaciones" DROP COLUMN "documentos"`);
    }
}
