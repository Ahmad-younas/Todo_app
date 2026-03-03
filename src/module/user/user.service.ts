import { UserRepository } from "./user.repository";
import { User, UserRole } from "./user.entity";
import { hashPassword, comparePassword } from "../../utils/password.util";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../../utils/jwt.util";

export interface SignupDto {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
    accessToken: string;
    refreshToken: string;
}

export class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async signup(signupDto: SignupDto): Promise<AuthResponse> {
        const { email, password, name, role } = signupDto;

        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error("User with this email already exists");
        }

        const hashedPassword = await hashPassword(password);

        const user = await this.userRepository.create({
            email,
            password: hashedPassword,
            name,
            role: role || UserRole.OWNER,
        });

        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        const refreshToken = generateRefreshToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            accessToken,
            refreshToken,
        };
    }

    async login(loginDto: LoginDto): Promise<AuthResponse> {
        const { email, password } = loginDto;

        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error("Invalid credentials");
        }

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }

        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        const refreshToken = generateRefreshToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            accessToken,
            refreshToken,
        };
    }

    async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
        try {
            const decoded = verifyRefreshToken(refreshToken);

            const user = await this.userRepository.findById(decoded.id);
            if (!user) {
                throw new Error("User not found");
            }

            const accessToken = generateAccessToken({
                id: user.id,
                email: user.email,
                role: user.role,
            });

            return { accessToken };
        } catch (error) {
            throw new Error("Invalid refresh token");
        }
    }

    async getProfile(userId: string): Promise<Omit<User, "password">> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
