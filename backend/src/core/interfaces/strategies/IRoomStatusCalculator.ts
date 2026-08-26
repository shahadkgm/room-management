import { RoomStatus, IRoom } from "../../models/Room";
import { IBooking } from "../../models/Booking";

export interface IRoomStatusCalculator {
  /**
   * Computes the real-time status of a room (available, occupied, reserved, maintenance)
   * given the room definition, its active/upcoming bookings, and the reference date.
   */
  computeStatus(
    room: IRoom,
    bookingsForRoom: IBooking[],
    referenceDate?: string
  ): RoomStatus;
}
