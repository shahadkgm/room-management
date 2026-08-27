import { IDashboardService, DashboardStatsDTO } from "../core/interfaces/services/IDashboardService";
import { IRoomRepository } from "../core/interfaces/repositories/IRoomRepository";
import { IBookingRepository } from "../core/interfaces/repositories/IBookingRepository";
import { IPatientRepository } from "../core/interfaces/repositories/IPatientRepository";
import { IRoomStatusCalculator } from "../core/interfaces/strategies/IRoomStatusCalculator";
import { PopulatedBooking, IBooking } from "../core/models/Booking";

export class DashboardService implements IDashboardService {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly patientRepository: IPatientRepository,
    private readonly statusCalculator: IRoomStatusCalculator
  ) {}

  private async populateBooking(b: IBooking): Promise<PopulatedBooking> {
    const patient = await this.patientRepository.findById(b.patientId);
    const room = await this.roomRepository.findById(b.roomId);

    return {
      ...b,
      patient: patient
        ? {
            id: patient.id,
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            phone: patient.phone,
            address: patient.address,
            ailment: patient.ailment,
          }
        : undefined,
      room: room
        ? {
            id: room.id,
            roomNumber: room.roomNumber,
            ward: room.ward,
            floor: room.floor,
            bedCount: room.bedCount,
          }
        : undefined,
    };
  }

  async getStats(referenceDate?: string): Promise<DashboardStatsDTO> {
    const todayStr = referenceDate || new Date().toISOString().split("T")[0];
    const todayTime = new Date(todayStr).getTime();

    const rooms = await this.roomRepository.list();
    const allBookings = await this.bookingRepository.list();

    // 1. Room Status Counts
    let availableCount = 0;
    let occupiedCount = 0;
    let reservedCount = 0;
    let maintenanceCount = 0;

    for (const room of rooms) {
      const roomBookings = allBookings.filter((b) => b.roomId === room.id);
      const status = this.statusCalculator.computeStatus(room, roomBookings, todayStr);

      if (status === "available") availableCount++;
      else if (status === "occupied") occupiedCount++;
      else if (status === "reserved") reservedCount++;
      else if (status === "maintenance") maintenanceCount++;
    }

    // 2. Expected Admissions Today
    const admissionsToday = allBookings.filter((b) => {
      return b.admissionDate === todayStr && b.status !== "cancelled";
    });

    // 3. Expected Discharges Today
    const dischargesToday = allBookings.filter((b) => {
      return (
        b.expectedDischargeDate === todayStr &&
        (b.status === "active" || (b.status === "completed" && b.actualDischargeDate === todayStr))
      );
    });

    // 4. Overdue Discharges (Expected discharge was before today, but patient is still active)
    const overdueDischarges = allBookings.filter((b) => {
      if (b.status !== "active") return false;
      const expectedEnd = new Date(b.expectedDischargeDate).getTime();
      return expectedEnd < todayTime;
    });

    const [admissionsTodayList, dischargesTodayList, overdueDischargesList] = await Promise.all([
      Promise.all(admissionsToday.map((b) => this.populateBooking(b))),
      Promise.all(dischargesToday.map((b) => this.populateBooking(b))),
      Promise.all(overdueDischarges.map((b) => this.populateBooking(b))),
    ]);

    return {
      totalRooms: rooms.length,
      availableRooms: availableCount,
      occupiedRooms: occupiedCount,
      reservedRooms: reservedCount,
      maintenanceRooms: maintenanceCount,
      expectedAdmissionsToday: admissionsToday.length,
      expectedDischargesToday: dischargesToday.length,
      admissionsTodayList,
      dischargesTodayList,
      overdueDischargesList,
    };
  }
}
