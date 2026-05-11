import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGithubIdToUsers1716500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna github_id a la tabla users
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "github_id" VARCHAR(255) NULL
    `);
    
    // Agregar índice único si no existe
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes WHERE indexname = 'UQ_users_github_id'
        ) THEN
          CREATE UNIQUE INDEX "UQ_users_github_id" ON "users"("github_id") 
          WHERE "github_id" IS NOT NULL;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar índice si existe
    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_users_github_id"
    `);
    
    // Eliminar columna
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN IF EXISTS "github_id"
    `);
  }
}
