import { Router, RequestHandler } from "express";
import { RoomController } from "../controllers/RoomController";
import { requireRole } from "../middleware/authMiddleware";

export function createRoomRoutes(
  roomController: RoomController,
  authMiddleware: RequestHandler
): Router {
  const router = Router();

  // Public/All-staff routes
  router.get("/", roomController.getAll);
  router.get("/:id", roomController.getById);

  // Protected operations
  router.post("/", authMiddleware, requireRole(["admin", "receptionist"]), roomController.create);
  router.put("/:id", authMiddleware, requireRole(["admin", "receptionist"]), roomController.update);
  router.delete("/:id", authMiddleware, requireRole(["admin", "receptionist"]), roomController.delete);
  router.patch("/:id/maintenance", authMiddleware, requireRole(["admin", "receptionist"]), roomController.setMaintenance);

  return router;
}
