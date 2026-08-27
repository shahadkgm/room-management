import { IUserRepository } from "../../core/interfaces/repositories/IUserRepository";
import { IPasswordHasher } from "../../core/interfaces/security/IPasswordHasher";

export async function seedInitialData(
  userRepo: IUserRepository,
  passwordHasher: IPasswordHasher
) {
  const users = await userRepo.list();
  if (users.length === 0) {
    console.log("🌱 Seeding default users (Admin & Receptionist)...");
    const adminPass = await passwordHasher.hash("admin123");
    const recPass = await passwordHasher.hash("rec123");

    await userRepo.create({
      name: "Dr. Hakim Al-Attar (Admin)",
      email: "admin@unani.com",
      passwordHash: adminPass,
      role: "admin",
      isAllowed: true,
    });

    await userRepo.create({
      name: "Shahad (Receptionist)",
      email: "receptionist@unani.com",
      passwordHash: recPass,
      role: "receptionist",
      isAllowed: true,
    });

    console.log("✅ Seed users populated successfully.");
  }
}
