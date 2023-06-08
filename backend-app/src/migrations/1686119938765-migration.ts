import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1686119938765 implements MigrationInterface {
    name = 'migration1686119938765'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`bookdetails\` CHANGE \`no_of_copies_rented\` \`no_of_copies_rented\` int NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`bookdetails\` CHANGE \`no_of_copies_rented\` \`no_of_copies_rented\` int NOT NULL
        `);
    }

}
