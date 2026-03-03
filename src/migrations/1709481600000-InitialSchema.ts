import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1709481600000 implements MigrationInterface {
    name = "InitialSchema1709481600000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create users table
        await queryRunner.query(`
            CREATE TYPE "user_role_enum" AS ENUM('owner', 'invited_member')
        `);

        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "name" character varying NOT NULL,
                "role" "user_role_enum" NOT NULL DEFAULT 'owner',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_user_email" UNIQUE ("email"),
                CONSTRAINT "PK_users" PRIMARY KEY ("id")
            )
        `);

        // Create workspaces table
        await queryRunner.query(`
            CREATE TABLE "workspaces" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying,
                "ownerId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_workspaces" PRIMARY KEY ("id")
            )
        `);

        // Create tasks table
        await queryRunner.query(`
            CREATE TYPE "task_status_enum" AS ENUM('todo', 'in_progress', 'completed')
        `);

        await queryRunner.query(`
            CREATE TYPE "task_priority_enum" AS ENUM('low', 'medium', 'high')
        `);

        await queryRunner.query(`
            CREATE TABLE "tasks" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text,
                "status" "task_status_enum" NOT NULL DEFAULT 'todo',
                "priority" "task_priority_enum" NOT NULL DEFAULT 'medium',
                "workspaceId" uuid NOT NULL,
                "dueDate" TIMESTAMP,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_tasks" PRIMARY KEY ("id")
            )
        `);

        // Create workspace_members junction table
        await queryRunner.query(`
            CREATE TABLE "workspace_members" (
                "workspaceId" uuid NOT NULL,
                "userId" uuid NOT NULL,
                CONSTRAINT "PK_workspace_members" PRIMARY KEY ("workspaceId", "userId")
            )
        `);

        // Add foreign keys
        await queryRunner.query(`
            ALTER TABLE "workspaces"
            ADD CONSTRAINT "FK_workspace_owner"
            FOREIGN KEY ("ownerId")
            REFERENCES "users"("id")
            ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "tasks"
            ADD CONSTRAINT "FK_task_workspace"
            FOREIGN KEY ("workspaceId")
            REFERENCES "workspaces"("id")
            ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "workspace_members"
            ADD CONSTRAINT "FK_workspace_members_workspace"
            FOREIGN KEY ("workspaceId")
            REFERENCES "workspaces"("id")
            ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "workspace_members"
            ADD CONSTRAINT "FK_workspace_members_user"
            FOREIGN KEY ("userId")
            REFERENCES "users"("id")
            ON DELETE CASCADE
        `);

        // Add indexes
        await queryRunner.query(`
            CREATE INDEX "IDX_workspace_owner" ON "workspaces" ("ownerId")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_task_workspace" ON "tasks" ("workspaceId")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_workspace_members_workspace" ON "workspace_members" ("workspaceId")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_workspace_members_user" ON "workspace_members" ("userId")
        `);

        // Add constraint to limit workspaces per user (1-5)
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION check_workspace_limit()
            RETURNS TRIGGER AS $$
            BEGIN
                IF (SELECT COUNT(*) FROM workspaces WHERE "ownerId" = NEW."ownerId") >= 5 THEN
                    RAISE EXCEPTION 'User cannot create more than 5 workspaces';
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);

        await queryRunner.query(`
            CREATE TRIGGER workspace_limit_trigger
            BEFORE INSERT ON workspaces
            FOR EACH ROW
            EXECUTE FUNCTION check_workspace_limit();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop trigger and function
        await queryRunner.query(`DROP TRIGGER IF EXISTS workspace_limit_trigger ON workspaces`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS check_workspace_limit()`);

        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_workspace_members_user"`);
        await queryRunner.query(`DROP INDEX "IDX_workspace_members_workspace"`);
        await queryRunner.query(`DROP INDEX "IDX_task_workspace"`);
        await queryRunner.query(`DROP INDEX "IDX_workspace_owner"`);

        // Drop foreign keys
        await queryRunner.query(`ALTER TABLE "workspace_members" DROP CONSTRAINT "FK_workspace_members_user"`);
        await queryRunner.query(`ALTER TABLE "workspace_members" DROP CONSTRAINT "FK_workspace_members_workspace"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_task_workspace"`);
        await queryRunner.query(`ALTER TABLE "workspaces" DROP CONSTRAINT "FK_workspace_owner"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "workspace_members"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`DROP TABLE "workspaces"`);
        await queryRunner.query(`DROP TABLE "users"`);

        // Drop enums
        await queryRunner.query(`DROP TYPE "task_priority_enum"`);
        await queryRunner.query(`DROP TYPE "task_status_enum"`);
        await queryRunner.query(`DROP TYPE "user_role_enum"`);
    }
}
