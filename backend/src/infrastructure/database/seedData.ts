import { IUserRepository } from "../../core/interfaces/repositories/IUserRepository";
import { IRoomRepository } from "../../core/interfaces/repositories/IRoomRepository";
import { IPatientRepository } from "../../core/interfaces/repositories/IPatientRepository";
import { IBookingRepository } from "../../core/interfaces/repositories/IBookingRepository";
import { IPasswordHasher } from "../../core/interfaces/security/IPasswordHasher";

export async function seedInitialData(
  userRepo: IUserRepository,
  roomRepo: IRoomRepository,
  patientRepo: IPatientRepository,
  bookingRepo: IBookingRepository,
  passwordHasher: IPasswordHasher
) {
  const users = await userRepo.list();
  if (users.length === 0) {
    console.log("🌱 Seeding default users (Admin & Receptionist)...");
    const adminPass = await passwordHasher.hash("admin123");
    const recPass = await passwordHasher.hash("rec123");
    const blockedPass = await passwordHasher.hash("blocked123");

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

    await userRepo.create({
      name: "Unapproved User",
      email: "blocked@unani.com",
      passwordHash: blockedPass,
      role: "receptionist",
      isAllowed: false,
    });
  }

  const rooms = await roomRepo.list();
  if (rooms.length === 0) {
    console.log("🌱 Seeding 7 test hospital rooms...");
    const sampleRooms = [
      { roomNumber: "102", ward: "General Ward", floor: 1, bedCount: 4, dailyRate: 800, amenities: ["Fan", "Attached Bath", "Nurse Call System"] },
      { roomNumber: "103", ward: "General Ward", floor: 1, bedCount: 2, dailyRate: 1200, amenities: ["AC", "Attached Bath", "Cupping Therapy Kit"] },
      { roomNumber: "104", ward: "General Ward", floor: 1, bedCount: 4, dailyRate: 800, amenities: ["Fan", "Nurse Call System"] },
      { roomNumber: "105", ward: "General Ward", floor: 1, bedCount: 2, dailyRate: 1200, amenities: ["AC", "Attached Bath", "Oxygen Supply"] },
      { roomNumber: "106", ward: "General Ward", floor: 1, bedCount: 4, dailyRate: 800, amenities: ["Fan", "Attached Bath"] },
      { roomNumber: "107", ward: "General Ward", floor: 1, bedCount: 4, dailyRate: 800, amenities: ["Fan", "Attached Bath"] },
      { roomNumber: "108", ward: "General Ward", floor: 1, bedCount: 4, dailyRate: 800, amenities: ["Fan", "Attached Bath"] },
    ];

    for (const r of sampleRooms) {
      await roomRepo.create(r);
    }
  }

  const patients = await patientRepo.list();
  if (patients.length === 0) {
    console.log("🌱 Seeding sample Unani Hospital patients & active/upcoming bookings...");
    const p1 = await patientRepo.create({
      name: "Muhammed Shahad",
      age: 46,
      gender: "female",
      phone: "+91 98471 23456",
      address: "Kunnamangalam Kuttikkattoor Road, Calicut",
      ailment: "Chronic Migraine & Headache (Suda Muzmin)",
      notes: "Prescribed Roghan-e-Kahu massage & Hijama therapy.",
    });

    const p2 = await patientRepo.create({
      name: "Aisha Begum",
      age: 52,
      gender: "female",
      phone: "+91 94470 65432",
      address: "Kallai Road, Kozhikode",
      ailment: "Joint Pain & Arthritis (Waja-ul-Mafasil)",
      notes: "Started on Majoon Suranjan & Dalk (therapeutic massage).",
    });

    const p3 = await patientRepo.create({
      name: "Faisal Rahman",
      age: 38,
      gender: "male",
      phone: "+91 97451 98765",
      address: "Palayam, Calicut",
      ailment: "Digestive Disorder (Su-e-Hazm)",
      notes: "Nutritional Unani dietary regimen and Jawarish Kamuni.",
    });

    const p4 = await patientRepo.create({
      name: "Zainab Fatima",
      age: 29,
      gender: "female",
      phone: "+91 99955 43210",
      address: "Mananchira, Kozhikode",
      ailment: "Skin Inflammation & Eczema (Hikka)",
      notes: "Scheduled for Fasd (Bloodletting therapy) on arrival.",
    });

    const room102 = await roomRepo.findByRoomNumber("102");
    const room103 = await roomRepo.findByRoomNumber("103");
    const room105 = await roomRepo.findByRoomNumber("105");

    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const inTwoDays = new Date(today);
    inTwoDays.setDate(today.getDate() + 2);

    const inFourDays = new Date(today);
    inFourDays.setDate(today.getDate() + 4);

    const inTenDays = new Date(today);
    inTenDays.setDate(today.getDate() + 10);

    if (room102) {
      await bookingRepo.create({
        patientId: p1.id,
        roomId: room102.id,
        admissionDate: formatDate(yesterday),
        expectedDischargeDate: formatDate(inTwoDays),
        status: "active",
        dailyRate: room102.dailyRate,
        notes: "Currently undergoing Steam Bath (Hammam) session.",
      });

      await bookingRepo.create({
        patientId: p1.id,
        roomId: room102.id,
        admissionDate: formatDate(inFourDays),
        expectedDischargeDate: formatDate(inTenDays),
        status: "reserved",
        dailyRate: room102.dailyRate,
        notes: "Follow-up stay for Hijama second cycle.",
      });
    }

    if (room103) {
      await bookingRepo.create({
        patientId: p2.id,
        roomId: room103.id,
        admissionDate: formatDate(yesterday),
        expectedDischargeDate: formatDate(inFourDays),
        status: "active",
        dailyRate: room103.dailyRate,
        notes: "Arthritis rehabilitation regimen.",
      });

      await bookingRepo.create({
        patientId: p4.id,
        roomId: room103.id,
        admissionDate: formatDate(inFourDays),
        expectedDischargeDate: formatDate(inTenDays),
        status: "reserved",
        dailyRate: room103.dailyRate,
        notes: "Skin therapy regimen admission.",
      });
    }

    if (room105) {
      await bookingRepo.create({
        patientId: p3.id,
        roomId: room105.id,
        admissionDate: formatDate(yesterday),
        expectedDischargeDate: formatDate(inTenDays),
        status: "active",
        dailyRate: room105.dailyRate,
        notes: "Digestive detox stay.",
      });
    }

    console.log("✅ Seed data populated with 7 test rooms successfully.");
  }
}
