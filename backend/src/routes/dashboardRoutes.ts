import { Router, RequestHandler } from "express";
import { DashboardController } from "../controllers/DashboardController";

export function createDashboardRoutes(
  dashboardController: DashboardController,
  authMiddleware: RequestHandler
): Router {
  const router = Router();

  router.get("/stats", dashboardController.getStats);

  return router;
}
