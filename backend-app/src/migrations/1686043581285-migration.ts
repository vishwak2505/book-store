import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1686043581285 implements MigrationInterface {
    name = 'migration1686043581285'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`user\` CHANGE \`amountDue\` \`amount_due\` int NULL
        `);
        await queryRunner.query(`
            CREATE TABLE \`bookdetails\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`book_name\` varchar(255) NOT NULL,
                \`genre\` varchar(255) NOT NULL,
                \`total_no_of_copies\` int NOT NULL,
                \`no_of_copies_rented\` int NOT NULL,
                \`cost_per_day\` int NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`book\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`bookDetailsId\` int NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`bookrented\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`date_of_issue\` datetime NOT NULL,
                \`date_of_return\` datetime NOT NULL,
                \`userId\` int NULL,
                \`bookId\` int NULL,
                UNIQUE INDEX \`REL_ac6c3a313831d448aa6e159a6a\` (\`bookId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`book\`
            ADD CONSTRAINT \`FK_ede81a5603c5a55825c040fb1d4\` FOREIGN KEY (\`bookDetailsId\`) REFERENCES \`bookdetails\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookrented\`
            ADD CONSTRAINT \`FK_cf433af0c3e86efe60d4070094b\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
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
            ALTER TABLE \`bookrented\` DROP FOREIGN KEY \`FK_cf433af0c3e86efe60d4070094b\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`book\` DROP FOREIGN KEY \`FK_ede81a5603c5a55825c040fb1d4\`
        `);
        await queryRunner.query(`
            DROP INDEX \`REL_ac6c3a313831d448aa6e159a6a\` ON \`bookrented\`
        `);
        await queryRunner.query(`
            DROP TABLE \`bookrented\`
        `);
        await queryRunner.query(`
            DROP TABLE \`book\`
        `);
        await queryRunner.query(`
            DROP TABLE \`bookdetails\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\` CHANGE \`amount_due\` \`amountDue\` int NULL
        `);
    }

}
