import { IBooking } from "../../models/Booking";

export interface IBookingConflictChecker {
  /**
   * Checks whether the target date range [admissionDate, expectedDischargeDate]
   * overlaps with any existing non-cancelled bookings.
   */
  hasConflict(
    admissionDate: string,
    expectedDischargeDate: string,
    existingBookings: IBooking[],
    excludeBookingId?: string
  ): boolean;
}
