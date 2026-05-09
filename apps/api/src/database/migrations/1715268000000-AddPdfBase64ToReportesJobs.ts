import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPdfBase64ToReportesJobs1715268000000 implements MigrationInterface {
    name = 'AddPdfBase64ToReportesJobs1715268000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reportes_jobs" ADD "pdf_base64" text`);
        await queryRunner.query(`COMMENT ON COLUMN "reportes_jobs"."pdf_base64" IS 'PDF generado codificado en base64. Reemplaza el almacenamiento en disco para compatibilidad con plataformas cloud efímeras.'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "reportes_jobs"."pdf_base64" IS NULL`);
        await queryRunner.query(`ALTER TABLE "reportes_jobs" DROP COLUMN "pdf_base64"`);
    }

}
