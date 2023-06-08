import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1686227387940 implements MigrationInterface {
    name = 'migration1686227387940'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`bookrented\` CHANGE \`date_of_return\` \`date_of_return\` datetime NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`bookrented\` CHANGE \`date_of_return\` \`date_of_return\` datetime NOT NULL
        `);
    }

}
