import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1686232208043 implements MigrationInterface {
    name = 'migration1686232208043'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`book\` CHANGE \`availability\` \`availability\` tinyint NOT NULL DEFAULT 1
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookrented\`
            ADD UNIQUE INDEX \`IDX_ac6c3a313831d448aa6e159a6a\` (\`bookId\`)
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`REL_ac6c3a313831d448aa6e159a6a\` ON \`bookrented\` (\`bookId\`)
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
            DROP INDEX \`REL_ac6c3a313831d448aa6e159a6a\` ON \`bookrented\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookrented\` DROP INDEX \`IDX_ac6c3a313831d448aa6e159a6a\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`book\` CHANGE \`availability\` \`availability\` tinyint NOT NULL
        `);
    }

}
