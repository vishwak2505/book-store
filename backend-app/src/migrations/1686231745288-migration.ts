import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1686231745288 implements MigrationInterface {
    name = 'migration1686231745288'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`bookrented\` DROP FOREIGN KEY \`FK_ac6c3a313831d448aa6e159a6a6\`
        `);
        await queryRunner.query(`
            DROP INDEX \`REL_ac6c3a313831d448aa6e159a6a\` ON \`bookrented\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`book\`
            ADD \`availability\` tinyint NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`book\` CHANGE \`availability\` \`id\` int NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`book\` DROP PRIMARY KEY
        `);
        await queryRunner.query(`
            ALTER TABLE \`book\`
            ADD PRIMARY KEY (\`id\`, \`availability\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`book\` CHANGE \`id\` \`availability\` tinyint NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookrented\`
            ADD \`bookAvailability\` tinyint NULL
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`REL_9a9f5ada6e59b29e9cb2775cb7\` ON \`bookrented\` (\`bookId\`, \`bookAvailability\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookrented\`
            ADD CONSTRAINT \`FK_9a9f5ada6e59b29e9cb2775cb76\` FOREIGN KEY (\`bookId\`, \`bookAvailability\`) REFERENCES \`book\`(\`id\`, \`availability\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`bookrented\` DROP FOREIGN KEY \`FK_9a9f5ada6e59b29e9cb2775cb76\`
        `);
        await queryRunner.query(`
            DROP INDEX \`REL_9a9f5ada6e59b29e9cb2775cb7\` ON \`bookrented\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookrented\` DROP COLUMN \`bookAvailability\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`book\` CHANGE \`availability\` \`id\` int NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`book\` DROP PRIMARY KEY
        `);
        await queryRunner.query(`
            ALTER TABLE \`book\`
            ADD PRIMARY KEY (\`id\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`book\` CHANGE \`id\` \`availability\` tinyint NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`book\` DROP COLUMN \`availability\`
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`REL_ac6c3a313831d448aa6e159a6a\` ON \`bookrented\` (\`bookId\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookrented\`
            ADD CONSTRAINT \`FK_ac6c3a313831d448aa6e159a6a6\` FOREIGN KEY (\`bookId\`) REFERENCES \`book\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
