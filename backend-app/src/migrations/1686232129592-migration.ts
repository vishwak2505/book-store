import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1686232129592 implements MigrationInterface {
    name = 'migration1686232129592'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`book\`
            ADD \`availability\` tinyint NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`book\` DROP COLUMN \`availability\`
        `);
    }

}
