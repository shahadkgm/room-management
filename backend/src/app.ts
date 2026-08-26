import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { AppContainer } from "./container";
import { createAuthRoutes } from "./routes/authRoutes";
import { createRoomRoutes } from "./routes/roomRoutes";
import { createBookingRoutes } from "./routes/bookingRoutes";
import { createPatientRoutes } from "./routes/patientRoutes";
import { createDashboardRoutes } from "./routes/dashboardRoutes";
import { createUserRoutes } from "./routes/userRoutes";
import { errorHandler } from "./middleware/errorHandler";

export function createApp(container: AppContainer): Express {
  const app = express();

  // Security headers (disable crossOriginResourcePolicy so CORS works with Vercel)
  app.use(helmet({ crossOriginResourcePolicy: false }));
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // Limit each IP to 30 login/auth requests per 15 min window
    message: { success: false, message: "Too many authentication requests from this IP, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // CORS — allow all origins (Vercel preview/production, localhost, etc.)
  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // allow requests with no origin (like mobile apps, curl, server-to-server) or any origin
      callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200,
  };
  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));
  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      message: "Unani Hospital Room Management API (Room Harmony) is operational.",
      timestamp: new Date().toISOString(),
    });
  });

  // Mount Feature Routes via Injected Controllers
  app.use("/api/auth", authLimiter, createAuthRoutes(container.authController, container.authMiddleware));
  app.use("/api/rooms", createRoomRoutes(container.roomController, container.authMiddleware));
  app.use("/api/bookings", createBookingRoutes(container.bookingController, container.authMiddleware));
  app.use("/api/patients", createPatientRoutes(container.patientController, container.authMiddleware));
  app.use("/api/dashboard", createDashboardRoutes(container.dashboardController, container.authMiddleware));
  app.use("/api/users", createUserRoutes(container.userController, container.tokenService));

  // Global Error Handler
  app.use(errorHandler);

  return app;
}