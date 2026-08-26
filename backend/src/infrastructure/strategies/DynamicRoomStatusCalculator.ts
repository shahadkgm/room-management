import { IRoomStatusCalculator } from "../../core/interfaces/strategies/IRoomStatusCalculator";
import { IRoom, RoomStatus } from "../../core/models/Room";
import { IBooking } from "../../core/models/Booking";

export class DynamicRoomStatusCalculator implements IRoomStatusCalculator {
  computeStatus(
    room: IRoom,
    bookingsForRoom: IBooking[],
    referenceDate?: string
  ): RoomStatus {
    if (room.isUnderMaintenance) {
      return "maintenance";
    }

    const todayStr = referenceDate || new Date().toISOString().split("T")[0];
    const todayTime = new Date(todayStr).getTime();

    // Check if there is an active booking where today falls within [admissionDate, expectedDischargeDate]
    const activeBooking = bookingsForRoom.find((b) => {
      if (b.status === "cancelled" || b.status === "completed") return false;
      const start = new Date(b.admissionDate).getTime();
      const end = new Date(b.actualDischargeDate || b.expectedDischargeDate).getTime();
      return todayTime >= start && todayTime < end;
    });

    if (activeBooking) {
      return "occupied";
    }

    // Check if there is a future upcoming reservation (admissionDate > today)
    const futureBooking = bookingsForRoom.find((b) => {
      if (b.status === "cancelled" || b.status === "completed") return false;
      const start = new Date(b.admissionDate).getTime();
      return start > todayTime;
    });

    if (futureBooking) {
      return "reserved";
    }

    return "available";
  }
}
