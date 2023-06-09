import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1686293729897 implements MigrationInterface {
    name = 'migration1686293729897'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`permission\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`codeName\` varchar(100) NOT NULL,
                UNIQUE INDEX \`IDX_390215abbc2901e2e623a69a03\` (\`codeName\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`group\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(80) NOT NULL,
                \`codeName\` varchar(100) NOT NULL,
                UNIQUE INDEX \`IDX_c13ca26406d3e9be800054b9a4\` (\`codeName\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
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
        await queryRunner.query(`
            CREATE TABLE \`bookdetails\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`book_name\` varchar(255) NOT NULL,
                \`genre\` varchar(255) NOT NULL,
                \`total_no_of_copies\` int NOT NULL,
                \`no_of_copies_rented\` int NULL,
                \`cost_per_day\` int NOT NULL,
                UNIQUE INDEX \`IDX_290282e9eb4dc8db7254881250\` (\`book_name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`book\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`availability\` tinyint NOT NULL DEFAULT 1,
                \`bookDetailsId\` int NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`bookrented\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`date_of_issue\` datetime NOT NULL,
                \`date_of_return\` datetime NULL,
                \`status\` enum ('active', 'closed') NOT NULL,
                \`userId\` int NOT NULL,
                \`bookId\` int NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`user\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`email\` varchar(255) NOT NULL,
                \`password\` varchar(255) NULL,
                \`amount_due\` int NULL,
                UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`group_permissions_permission\` (
                \`groupId\` int NOT NULL,
                \`permissionId\` int NOT NULL,
                INDEX \`IDX_24022d7e409de3835f25603d35\` (\`groupId\`),
                INDEX \`IDX_0777702b851f7662e2678b4568\` (\`permissionId\`),
                PRIMARY KEY (\`groupId\`, \`permissionId\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`user_groups_group\` (
                \`userId\` int NOT NULL,
                \`groupId\` int NOT NULL,
                INDEX \`IDX_84ff6a520aee2bf2512c01cf46\` (\`userId\`),
                INDEX \`IDX_8abdfe8f9d78a4f5e821dbf620\` (\`groupId\`),
                PRIMARY KEY (\`userId\`, \`groupId\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`user_user_permissions_permission\` (
                \`userId\` int NOT NULL,
                \`permissionId\` int NOT NULL,
                INDEX \`IDX_4c3462965c06c5bc3c8996f452\` (\`userId\`),
                INDEX \`IDX_4a38ad03e94f4de594fc09fb53\` (\`permissionId\`),
                PRIMARY KEY (\`userId\`, \`permissionId\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`book\`
            ADD CONSTRAINT \`FK_ede81a5603c5a55825c040fb1d4\` FOREIGN KEY (\`bookDetailsId\`) REFERENCES \`bookdetails\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookrented\`
            ADD CONSTRAINT \`FK_cf433af0c3e86efe60d4070094b\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookrented\`
            ADD CONSTRAINT \`FK_ac6c3a313831d448aa6e159a6a6\` FOREIGN KEY (\`bookId\`) REFERENCES \`book\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`group_permissions_permission\`
            ADD CONSTRAINT \`FK_24022d7e409de3835f25603d35d\` FOREIGN KEY (\`groupId\`) REFERENCES \`group\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE \`group_permissions_permission\`
            ADD CONSTRAINT \`FK_0777702b851f7662e2678b45689\` FOREIGN KEY (\`permissionId\`) REFERENCES \`permission\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_groups_group\`
            ADD CONSTRAINT \`FK_84ff6a520aee2bf2512c01cf462\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_groups_group\`
            ADD CONSTRAINT \`FK_8abdfe8f9d78a4f5e821dbf6203\` FOREIGN KEY (\`groupId\`) REFERENCES \`group\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_user_permissions_permission\`
            ADD CONSTRAINT \`FK_4c3462965c06c5bc3c8996f4524\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_user_permissions_permission\`
            ADD CONSTRAINT \`FK_4a38ad03e94f4de594fc09fb53c\` FOREIGN KEY (\`permissionId\`) REFERENCES \`permission\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`user_user_permissions_permission\` DROP FOREIGN KEY \`FK_4a38ad03e94f4de594fc09fb53c\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_user_permissions_permission\` DROP FOREIGN KEY \`FK_4c3462965c06c5bc3c8996f4524\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_groups_group\` DROP FOREIGN KEY \`FK_8abdfe8f9d78a4f5e821dbf6203\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user_groups_group\` DROP FOREIGN KEY \`FK_84ff6a520aee2bf2512c01cf462\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`group_permissions_permission\` DROP FOREIGN KEY \`FK_0777702b851f7662e2678b45689\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`group_permissions_permission\` DROP FOREIGN KEY \`FK_24022d7e409de3835f25603d35d\`
        `);
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
            DROP INDEX \`IDX_4a38ad03e94f4de594fc09fb53\` ON \`user_user_permissions_permission\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_4c3462965c06c5bc3c8996f452\` ON \`user_user_permissions_permission\`
        `);
        await queryRunner.query(`
            DROP TABLE \`user_user_permissions_permission\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_8abdfe8f9d78a4f5e821dbf620\` ON \`user_groups_group\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_84ff6a520aee2bf2512c01cf46\` ON \`user_groups_group\`
        `);
        await queryRunner.query(`
            DROP TABLE \`user_groups_group\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_0777702b851f7662e2678b4568\` ON \`group_permissions_permission\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_24022d7e409de3835f25603d35\` ON \`group_permissions_permission\`
        `);
        await queryRunner.query(`
            DROP TABLE \`group_permissions_permission\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\`
        `);
        await queryRunner.query(`
            DROP TABLE \`user\`
        `);
        await queryRunner.query(`
            DROP TABLE \`bookrented\`
        `);
        await queryRunner.query(`
            DROP TABLE \`book\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_290282e9eb4dc8db7254881250\` ON \`bookdetails\`
        `);
        await queryRunner.query(`
            DROP TABLE \`bookdetails\`
        `);
        await queryRunner.query(`
            DROP TABLE \`sessions\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_c13ca26406d3e9be800054b9a4\` ON \`group\`
        `);
        await queryRunner.query(`
            DROP TABLE \`group\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_390215abbc2901e2e623a69a03\` ON \`permission\`
        `);
        await queryRunner.query(`
            DROP TABLE \`permission\`
        `);
    }

}
