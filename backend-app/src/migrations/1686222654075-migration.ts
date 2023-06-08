import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1686222654075 implements MigrationInterface {
    name = 'migration1686222654075'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`book\` DROP FOREIGN KEY \`FK_ede81a5603c5a55825c040fb1d4\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`book\` CHANGE \`bookDetailsId\` \`bookDetailsId\` int NOT NULL
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
            ALTER TABLE \`book\` CHANGE \`bookDetailsId\` \`bookDetailsId\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`book\`
            ADD CONSTRAINT \`FK_ede81a5603c5a55825c040fb1d4\` FOREIGN KEY (\`bookDetailsId\`) REFERENCES \`bookdetails\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

}
