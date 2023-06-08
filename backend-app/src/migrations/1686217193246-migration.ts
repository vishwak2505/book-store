import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1686217193246 implements MigrationInterface {
    name = 'migration1686217193246'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`book\` DROP FOREIGN KEY \`FK_ede81a5603c5a55825c040fb1d4\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookdetails\`
            ADD UNIQUE INDEX \`IDX_290282e9eb4dc8db7254881250\` (\`book_name\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`book\`
            ADD CONSTRAINT \`FK_ede81a5603c5a55825c040fb1d4\` FOREIGN KEY (\`bookDetailsId\`) REFERENCES \`bookdetails\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`book\` DROP FOREIGN KEY \`FK_ede81a5603c5a55825c040fb1d4\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookdetails\` DROP INDEX \`IDX_290282e9eb4dc8db7254881250\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`book\`
            ADD CONSTRAINT \`FK_ede81a5603c5a55825c040fb1d4\` FOREIGN KEY (\`bookDetailsId\`) REFERENCES \`bookdetails\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
