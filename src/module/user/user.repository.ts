import { AppDataSource } from "../../config/data-source";
import { User } from "./user.entity";

export class UserRepository {
    private repository = AppDataSource.getRepository(User);

    async findByEmail(email: string): Promise<User | null> {
        return await this.repository.findOne({ where: { email } });
    }

    async findById(id: string): Promise<User | null> {
        return await this.repository.findOne({ where: { id } });
    }

    async create(userData: Partial<User>): Promise<User> {
        const user = this.repository.create(userData);
        return await this.repository.save(user);
    }

    async save(user: User): Promise<User> {
        return await this.repository.save(user);
    }

    async countWorkspacesByUserId(userId: string): Promise<number> {
        const user = await this.repository.findOne({
            where: { id: userId },
            relations: ["ownedWorkspaces"],
        });
        return user?.ownedWorkspaces?.length || 0;
    }
}
