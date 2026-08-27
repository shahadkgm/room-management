import { IBookingRepository } from "../core/interfaces/repositories/IBookingRepository";
import { IPatientRepository } from "../core/interfaces/repositories/IPatientRepository";

const DAYS_AFTER_DISCHARGE = 2;
const INTERVAL_MS = 60 * 60 * 1000; // every 1 hour

export function startCleanupJob(
  bookingRepository: IBookingRepository,
  patientRepository: IPatientRepository
): void {
  const runCleanup = async () => {
    try {
      const allBookings = await bookingRepository.list({ status: "completed" });
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      let deletedCount = 0;

      for (const booking of allBookings) {
        if (!booking.actualDischargeDate) continue;

        const dischargeDate = new Date(booking.actualDischargeDate);
        dischargeDate.setHours(0, 0, 0, 0);

        const daysSinceDischarge = Math.floor(
          (now.getTime() - dischargeDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceDischarge >= DAYS_AFTER_DISCHARGE) {
          // Delete patient record first, then booking
          await patientRepository.delete(booking.patientId);
          await bookingRepository.delete(booking.id);
          deletedCount++;
          console.log(
            `[Cleanup] Deleted patient ${booking.patientId} and booking ${booking.id} (discharged ${daysSinceDischarge} days ago)`
          );
        }
      }

      if (deletedCount > 0) {
        console.log(`[Cleanup] Removed ${deletedCount} discharged patient record(s).`);
      }
    } catch (err) {
      console.error("[Cleanup] Auto-delete job failed:", err);
    }
  };

  // Run immediately on startup, then every hour
  runCleanup();
  setInterval(runCleanup, INTERVAL_MS);
  console.log("[Cleanup] Auto-delete job started — runs every hour, removes discharged patients after 2 days.");
}
