import { MigrationInterface, QueryRunner } from "typeorm";

export class migration1686036925019 implements MigrationInterface {
    name = 'migration1686036925019'

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
            CREATE TABLE \`user\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`email\` varchar(255) NOT NULL,
                \`password\` varchar(255) NULL,
                \`amountDue\` int NULL,
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
