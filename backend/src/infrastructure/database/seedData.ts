import { IUserRepository } from "../../core/interfaces/repositories/IUserRepository";
import { IPasswordHasher } from "../../core/interfaces/security/IPasswordHasher";

export async function seedInitialData(
  userRepo: IUserRepository,
  passwordHasher: IPasswordHasher
) {
  const seedConfigs = [
    {
      name: process.env.ADMIN_NAME || "Administrator",
      email: (process.env.ADMIN_EMAIL || "").trim().toLowerCase(),
      password: process.env.ADMIN_PASSWORD,
      role: "admin" as const,
    },
    {
      name: process.env.RECEPTIONIST_NAME || "Receptionist",
      email: (process.env.RECEPTIONIST_EMAIL || "").trim().toLowerCase(),
      password: process.env.RECEPTIONIST_PASSWORD,
      role: "receptionist" as const,
    },
    {
      name: process.env.VISITOR_NAME || "Visitor",
      email: (process.env.VISITOR_EMAIL || "").trim().toLowerCase(),
      password: process.env.VISITOR_PASSWORD,
      role: "visitor" as const,
    },
  ];

  for (const config of seedConfigs) {
    if (!config.email || !config.password) {
      continue;
    }

    const passwordHash = await passwordHasher.hash(config.password);
    const existing = await userRepo.findByEmail(config.email);

    if (!existing) {
      console.log(`🌱 Seeding initial ${config.role} user (${config.email})...`);
      await userRepo.create({
        name: config.name,
        email: config.email,
        passwordHash,
        role: config.role,
        isAllowed: true,
      });
      console.log(`✅ Seed ${config.role} user populated successfully.`);
    } else {
      console.log(`🔄 Syncing credentials & access for ${config.role} (${config.email})...`);
      await userRepo.update(existing.id, {
        name: config.name,
        passwordHash,
        role: config.role,
        isAllowed: true,
      });
      console.log(`✅ ${config.role} user credentials synchronized.`);
    }
  }
}
