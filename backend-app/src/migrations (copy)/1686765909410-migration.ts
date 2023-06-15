import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1686765909410 implements MigrationInterface {
    name = 'migration1686765909410'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`bookdetails\`
            ADD \`bookStatus\` enum ('active', 'closed') NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`status\` enum ('active', 'inactive') NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`status\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookdetails\` DROP COLUMN \`bookStatus\`
        `);
    }

}
