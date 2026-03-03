import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToMany,
} from "typeorm";
import { Workspace } from "../workspace/workspace.entity";

export enum UserRole {
    OWNER = "owner",
    INVITED_MEMBER = "invited_member",
}

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    name: string;

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.OWNER,
    })
    role: UserRole;

    @OneToMany(() => Workspace, (workspace) => workspace.owner)
    ownedWorkspaces: Workspace[];

    @ManyToMany(() => Workspace, (workspace) => workspace.members)
    memberWorkspaces: Workspace[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
