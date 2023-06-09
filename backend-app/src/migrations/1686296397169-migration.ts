import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1686296397169 implements MigrationInterface {
    name = 'migration1686296397169'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`bookrented\` DROP FOREIGN KEY \`FK_ac6c3a313831d448aa6e159a6a6\`
        `);
        await queryRunner.query(`
            CREATE TABLE \`bookrented_book_book\` (
                \`bookrentedId\` int NOT NULL,
                \`bookId\` int NOT NULL,
                INDEX \`IDX_eb86d3580cd709dbc9ac9553f2\` (\`bookrentedId\`),
                INDEX \`IDX_894097c61f8abd8c7ca6b5e7d2\` (\`bookId\`),
                PRIMARY KEY (\`bookrentedId\`, \`bookId\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookrented\` DROP COLUMN \`bookId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookrented_book_book\`
            ADD CONSTRAINT \`FK_eb86d3580cd709dbc9ac9553f27\` FOREIGN KEY (\`bookrentedId\`) REFERENCES \`bookrented\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookrented_book_book\`
            ADD CONSTRAINT \`FK_894097c61f8abd8c7ca6b5e7d24\` FOREIGN KEY (\`bookId\`) REFERENCES \`book\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`bookrented_book_book\` DROP FOREIGN KEY \`FK_894097c61f8abd8c7ca6b5e7d24\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookrented_book_book\` DROP FOREIGN KEY \`FK_eb86d3580cd709dbc9ac9553f27\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookrented\`
            ADD \`bookId\` int NULL
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_894097c61f8abd8c7ca6b5e7d2\` ON \`bookrented_book_book\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_eb86d3580cd709dbc9ac9553f2\` ON \`bookrented_book_book\`
        `);
        await queryRunner.query(`
            DROP TABLE \`bookrented_book_book\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookrented\`
            ADD CONSTRAINT \`FK_ac6c3a313831d448aa6e159a6a6\` FOREIGN KEY (\`bookId\`) REFERENCES \`book\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
