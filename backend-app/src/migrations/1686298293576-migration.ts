import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1686298293576 implements MigrationInterface {
    name = 'migration1686298293576'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`bookrented\`
            ADD \`bookId\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookrented\`
            ADD CONSTRAINT \`FK_ac6c3a313831d448aa6e159a6a6\` FOREIGN KEY (\`bookId\`) REFERENCES \`book\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`bookrented\` DROP FOREIGN KEY \`FK_ac6c3a313831d448aa6e159a6a6\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookrented\` DROP COLUMN \`bookId\`
        `);
    }

}
