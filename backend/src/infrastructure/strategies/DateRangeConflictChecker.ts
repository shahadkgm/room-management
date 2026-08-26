import { IBookingConflictChecker } from "../../core/interfaces/strategies/IBookingConflictChecker";
import { IBooking } from "../../core/models/Booking";

export class DateRangeConflictChecker implements IBookingConflictChecker {
  /**
   * Evaluates if two date intervals [startA, endA] and [startB, endB] overlap.
   * Format: YYYY-MM-DD strings.
   * Condition for overlap: startA < endB && endA > startB
   */
  hasConflict(
    admissionDate: string,
    expectedDischargeDate: string,
    existingBookings: IBooking[],
    excludeBookingId?: string
  ): boolean {
    const newStart = new Date(admissionDate).getTime();
    const newEnd = new Date(expectedDischargeDate).getTime();

    if (isNaN(newStart) || isNaN(newEnd) || newStart >= newEnd) {
      throw new Error("Invalid booking date range: Admission date must be earlier than Expected Discharge date.");
    }

    for (const booking of existingBookings) {
      if (excludeBookingId && booking.id === excludeBookingId) {
        continue;
      }

      // Ignore cancelled or already completed bookings
      if (booking.status === "cancelled" || booking.status === "completed") {
        continue;
      }

      const existingStart = new Date(booking.admissionDate).getTime();
      // If actualDischargeDate exists, use it, else expectedDischargeDate
      const existingEnd = new Date(booking.actualDischargeDate || booking.expectedDischargeDate).getTime();

      // Check overlap condition: (StartA < EndB) and (EndA > StartB)
      if (newStart < existingEnd && newEnd > existingStart) {
        return true;
      }
    }

    return false;
  }
}
