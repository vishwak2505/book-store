import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1686130051729 implements MigrationInterface {
    name = 'migration1686130051729'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`sessions\` (
                \`id\` varchar(44) NOT NULL,
                \`user_id\` int NULL,
                \`content\` text NOT NULL,
                \`flash\` text NOT NULL,
                \`updated_at\` int NOT NULL,
                \`created_at\` int NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE \`sessions\`
        `);
    }

}
