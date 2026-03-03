import { Request, Response } from "express";
import { UserService } from "./user.service";
import { AuthRequest } from "../../middleware/auth.middleware";

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    signup = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password, name, role } = req.body;

            if (!email || !password || !name) {
                res.status(400).json({ error: "Email, password, and name are required" });
                return;
            }

            if (password.length < 8) {
                res.status(400).json({ error: "Password must be at least 8 characters long" });
                return;
            }

            const result = await this.userService.signup({ email, password, name, role });
            res.status(201).json(result);
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Internal server error" });
            }
        }
    };

    login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ error: "Email and password are required" });
                return;
            }

            const result = await this.userService.login({ email, password });
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof Error) {
                res.status(401).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Internal server error" });
            }
        }
    };

    refreshToken = async (req: Request, res: Response): Promise<void> => {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(400).json({ error: "Refresh token is required" });
                return;
            }

            const result = await this.userService.refreshToken(refreshToken);
            res.status(200).json(result);
        } catch (error) {
            if (error instanceof Error) {
                res.status(401).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Internal server error" });
            }
        }
    };

    getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }

            const profile = await this.userService.getProfile(req.user.id);
            res.status(200).json(profile);
        } catch (error) {
            if (error instanceof Error) {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: "Internal server error" });
            }
        }
    };
}
