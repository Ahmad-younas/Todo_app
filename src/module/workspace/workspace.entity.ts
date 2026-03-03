import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    ManyToMany,
    JoinTable,
} from "typeorm";
import { User } from "../user/user.entity";
import { Task } from "../task/task.entity";

@Entity("workspaces")
export class Workspace {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @ManyToOne(() => User, (user) => user.ownedWorkspaces, { onDelete: "CASCADE" })
    owner: User;

    @Column()
    ownerId: string;

    @ManyToMany(() => User, (user) => user.memberWorkspaces)
    @JoinTable({
        name: "workspace_members",
        joinColumn: { name: "workspaceId", referencedColumnName: "id" },
        inverseJoinColumn: { name: "userId", referencedColumnName: "id" },
    })
    members: User[];

    @OneToMany(() => Task, (task) => task.workspace)
    tasks: Task[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
