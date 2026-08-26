import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { createAuthMiddleware, requireRole } from "../middleware/authMiddleware";
import { ITokenService } from "../core/interfaces/security/ITokenService";

export function createUserRoutes(
  userController: UserController,
  tokenService: ITokenService
): Router {
  const router = Router();
  const authMiddleware = createAuthMiddleware(tokenService);
  const adminOnly = requireRole(["admin"]);

  // All user routes require admin role
  router.use(authMiddleware);
  router.use(adminOnly);

  router.get("/", userController.getAllUsers);
  router.put("/:id/allow", userController.updateUserAllowance);
  router.delete("/:id", userController.deleteUser);

  return router;
}
