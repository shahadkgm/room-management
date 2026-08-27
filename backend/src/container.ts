import { IUserRepository } from "./core/interfaces/repositories/IUserRepository";
import { IRoomRepository } from "./core/interfaces/repositories/IRoomRepository";
import { IPatientRepository } from "./core/interfaces/repositories/IPatientRepository";
import { IBookingRepository } from "./core/interfaces/repositories/IBookingRepository";
import { IPasswordHasher } from "./core/interfaces/security/IPasswordHasher";
import { ITokenService } from "./core/interfaces/security/ITokenService";
import { IBookingConflictChecker } from "./core/interfaces/strategies/IBookingConflictChecker";
import { IRoomStatusCalculator } from "./core/interfaces/strategies/IRoomStatusCalculator";

import { IAuthService } from "./core/interfaces/services/IAuthService";
import { IRoomService } from "./core/interfaces/services/IRoomService";
import { IBookingService } from "./core/interfaces/services/IBookingService";
import { IPatientService } from "./core/interfaces/services/IPatientService";
import { IDashboardService } from "./core/interfaces/services/IDashboardService";

import { BcryptHasher } from "./infrastructure/security/BcryptHasher";
import { JwtTokenService } from "./infrastructure/security/JwtTokenService";
import { DateRangeConflictChecker } from "./infrastructure/strategies/DateRangeConflictChecker";
import { DynamicRoomStatusCalculator } from "./infrastructure/strategies/DynamicRoomStatusCalculator";
import { startCleanupJob } from "./jobs/cleanupDischargedPatients";

import { MongoUserRepository } from "./infrastructure/repositories/MongoUserRepository";
import { MongoRoomRepository } from "./infrastructure/repositories/MongoRoomRepository";
import { MongoPatientRepository } from "./infrastructure/repositories/MongoPatientRepository";
import { MongoBookingRepository } from "./infrastructure/repositories/MongoBookingRepository";

import { AuthService } from "./service/AuthService";
import { RoomService } from "./service/RoomService";
import { BookingService } from "./service/BookingService";
import { PatientService } from "./service/PatientService";
import { DashboardService } from "./service/DashboardService";

import { AuthController } from "./controllers/AuthController";
import { RoomController } from "./controllers/RoomController";
import { BookingController } from "./controllers/BookingController";
import { PatientController } from "./controllers/PatientController";
import { DashboardController } from "./controllers/DashboardController";
import { UserController } from "./controllers/UserController";

import { createAuthMiddleware } from "./middleware/authMiddleware";
import { DatabaseManager } from "./infrastructure/database/connection";
import { seedInitialData } from "./infrastructure/database/seedData";

export interface AppContainer {
  // Repositories
  userRepository: IUserRepository;
  roomRepository: IRoomRepository;
  patientRepository: IPatientRepository;
  bookingRepository: IBookingRepository;

  // Security & Strategies
  passwordHasher: IPasswordHasher;
  tokenService: ITokenService;
  conflictChecker: IBookingConflictChecker;
  statusCalculator: IRoomStatusCalculator;

  // Services
  authService: IAuthService;
  roomService: IRoomService;
  bookingService: IBookingService;
  patientService: IPatientService;
  dashboardService: IDashboardService;

  // Controllers
  authController: AuthController;
  roomController: RoomController;
  bookingController: BookingController;
  patientController: PatientController;
  dashboardController: DashboardController;
  userController: UserController;

  // Middleware
  authMiddleware: ReturnType<typeof createAuthMiddleware>;
}

/**
 * 🌟 Composition Root (Dependency Injection Container)
 *
 * This is the ONLY place in the application where concrete implementations
 * are instantiated and wired together. All higher-level modules (Services,
 * Controllers) depend only on abstractions (Interfaces) — conforming to the
 * Dependency Inversion Principle (DIP).
 *
 * Wiring order:
 *   Infrastructure (Repos, Security, Strategies)
 *     → Services (Business Logic)
 *       → Controllers (HTTP Layer)
 *         → Routes (Express)
 */
export async function createContainer(): Promise<AppContainer> {
  // 1. Connect to MongoDB (required — no fallback)
  await DatabaseManager.connect();

  // 2. Instantiate Repositories — concrete MongoDB implementations
  //    (LSP: could swap for any IXxxRepository-compliant adapter without touching services)
  const userRepository: IUserRepository = new MongoUserRepository();
  const roomRepository: IRoomRepository = new MongoRoomRepository();
  const patientRepository: IPatientRepository = new MongoPatientRepository();
  const bookingRepository: IBookingRepository = new MongoBookingRepository();

  // 3. Instantiate Security & Strategy Adapters
  //    (ISP: each adapter only implements the interface its consumer needs)
  const passwordHasher: IPasswordHasher = new BcryptHasher(10);
  const tokenService: ITokenService = new JwtTokenService(
    process.env.JWT_SECRET || "unani_hospital_jwt_secret_key",
    "7d"
  );
  const conflictChecker: IBookingConflictChecker = new DateRangeConflictChecker();
  const statusCalculator: IRoomStatusCalculator = new DynamicRoomStatusCalculator();

  // Seed default users (Admin & Receptionist) if missing
  try {
    await seedInitialData(userRepository, passwordHasher);
  } catch (err) {
    console.warn("Seeding failed or already complete:", err);
  }

  // Start background job: auto-delete patient data 2 days after discharge
  startCleanupJob(bookingRepository, patientRepository);

  // 4. Inject dependencies into Service Layer (SRP + DIP)
  //    Services receive abstractions via constructor injection — never concrete classes.
  const authService: IAuthService = new AuthService(userRepository, passwordHasher, tokenService);
  const roomService: IRoomService = new RoomService(
    roomRepository,
    bookingRepository,
    patientRepository,
    statusCalculator
  );
  const bookingService: IBookingService = new BookingService(
    bookingRepository,
    roomRepository,
    patientRepository,
    conflictChecker,
    statusCalculator
  );
  const patientService: IPatientService = new PatientService(
    patientRepository,
    bookingRepository,
    roomRepository
  );
  const dashboardService: IDashboardService = new DashboardService(
    roomRepository,
    bookingRepository,
    patientRepository,
    statusCalculator
  );

  // 5. Inject Services into Controllers (HTTP transport layer only)
  const authController = new AuthController(authService);
  const roomController = new RoomController(roomService);
  const bookingController = new BookingController(bookingService);
  const patientController = new PatientController(patientService);
  const dashboardController = new DashboardController(dashboardService);
  const userController = new UserController(userRepository);

  // 6. Auth middleware factory — receives token service via closure (DIP)
  const authMiddleware = createAuthMiddleware(tokenService);

  return {
    userRepository,
    roomRepository,
    patientRepository,
    bookingRepository,
    passwordHasher,
    tokenService,
    conflictChecker,
    statusCalculator,
    authService,
    roomService,
    bookingService,
    patientService,
    dashboardService,
    authController,
    roomController,
    bookingController,
    patientController,
    dashboardController,
    userController,
    authMiddleware,
  };
}
