import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1687327259740 implements MigrationInterface {
    name = 'migration1687327259740'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`book\`
            ADD \`status\` varchar(255) NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`book\` DROP COLUMN \`status\`
        `);
    }

}
