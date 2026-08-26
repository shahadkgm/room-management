import { Router, RequestHandler } from "express";
import { BookingController } from "../controllers/BookingController";
import { requireRole } from "../middleware/authMiddleware";

export function createBookingRoutes(
  bookingController: BookingController,
  authMiddleware: RequestHandler
): Router {
  const router = Router();

  router.get("/", bookingController.getAll);
  router.get("/timeline", bookingController.getTimeline);
  router.get("/:id", bookingController.getById);

  router.post("/", authMiddleware, requireRole(["admin", "receptionist"]), bookingController.create);
  router.post("/direct-admit", authMiddleware, requireRole(["admin", "receptionist"]), bookingController.directAdmit);
  router.post("/:id/discharge", authMiddleware, requireRole(["admin", "receptionist"]), bookingController.discharge);
  router.post("/:id/cancel", authMiddleware, requireRole(["admin", "receptionist"]), bookingController.cancel);

  return router;
}
