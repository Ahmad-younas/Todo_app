import { Router } from "express";
import { UserController } from "../module/user/user.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
const userController = new UserController();

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/refresh-token", userController.refreshToken);
router.get("/profile", authenticate, userController.getProfile);

export default router;
