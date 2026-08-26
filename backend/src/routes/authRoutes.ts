import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { RequestHandler } from "express";

export function createAuthRoutes(authController: AuthController, authMiddleware: RequestHandler): Router {
  const router = Router();

  router.post("/register", authController.register);
  router.post("/login", authController.login);
  router.get("/me", authMiddleware, authController.getMe);

  return router;
}
