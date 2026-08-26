import { Router, RequestHandler } from "express";
import { PatientController } from "../controllers/PatientController";
import { requireRole } from "../middleware/authMiddleware";

export function createPatientRoutes(
  patientController: PatientController,
  authMiddleware: RequestHandler
): Router {
  const router = Router();

  router.get("/", authMiddleware, patientController.getAll);
  router.get("/:id", authMiddleware, patientController.getById);
  router.post("/", authMiddleware, requireRole(["admin", "receptionist"]), patientController.create);
  router.put("/:id", authMiddleware, requireRole(["admin", "receptionist"]), patientController.update);
  router.delete("/:id", authMiddleware, requireRole(["admin"]), patientController.delete);

  return router;
}
