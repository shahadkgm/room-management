import { IBookingService } from "../core/interfaces/services/IBookingService";
import { IBookingRepository } from "../core/interfaces/repositories/IBookingRepository";
import { IRoomRepository } from "../core/interfaces/repositories/IRoomRepository";
import { IPatientRepository } from "../core/interfaces/repositories/IPatientRepository";
import { IBookingConflictChecker } from "../core/interfaces/strategies/IBookingConflictChecker";
import { IRoomStatusCalculator } from "../core/interfaces/strategies/IRoomStatusCalculator";
import { IBooking, CreateBookingDTO, DirectAdmissionDTO, DischargePatientDTO, PopulatedBooking } from "../core/models/Booking";

export class BookingService implements IBookingService {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly roomRepository: IRoomRepository,
    private readonly patientRepository: IPatientRepository,
    private readonly conflictChecker: IBookingConflictChecker,
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

  async getAllBookings(filter?: { status?: any; roomId?: string; patientId?: string }): Promise<PopulatedBooking[]> {
    const bookings = await this.bookingRepository.list(filter);
    return Promise.all(bookings.map((b) => this.populateBooking(b)));
  }

  async getBookingById(id: string): Promise<PopulatedBooking | null> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) return null;
    return this.populateBooking(booking);
  }

  async createBooking(dto: CreateBookingDTO): Promise<IBooking> {
    const room = await this.roomRepository.findById(dto.roomId);
    if (!room) throw new Error("Room not found.");
    if (room.isUnderMaintenance) {
      throw new Error(`Room ${room.roomNumber} is currently under maintenance.`);
    }

    const patient = await this.patientRepository.findById(dto.patientId);
    if (!patient) throw new Error("Patient not found.");

    // Check for double booking conflict using strategy
    const existingBookings = await this.bookingRepository.findByRoomId(dto.roomId);
    const hasConflict = this.conflictChecker.hasConflict(dto.admissionDate, dto.expectedDischargeDate, existingBookings);
    if (hasConflict) {
      throw new Error(`Schedule conflict: Room ${room.roomNumber} is already booked during this date window.`);
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const isFuture = dto.admissionDate > todayStr;
    const initialStatus = isFuture ? "reserved" : "active";

    return this.bookingRepository.create({
      ...dto,
      status: initialStatus,
    });
  }

  async directAdmitPatient(dto: DirectAdmissionDTO): Promise<{ booking: IBooking; patientId: string }> {
    const room = await this.roomRepository.findById(dto.roomId);
    if (!room) throw new Error("Room not found.");
    if (room.isUnderMaintenance) {
      throw new Error(`Room ${room.roomNumber} is currently under maintenance.`);
    }

    // Check conflict
    const existingBookings = await this.bookingRepository.findByRoomId(dto.roomId);
    const hasConflict = this.conflictChecker.hasConflict(dto.admissionDate, dto.expectedDischargeDate, existingBookings);
    if (hasConflict) {
      throw new Error(`Schedule conflict: Room ${room.roomNumber} is already booked for this duration.`);
    }

    // 1. Create Patient Record
    const patient = await this.patientRepository.create(dto.patient);

    // 2. Create Booking
    const todayStr = new Date().toISOString().split("T")[0];
    const isFuture = dto.admissionDate > todayStr;
    const initialStatus = isFuture ? "reserved" : "active";

    const booking = await this.bookingRepository.create({
      patientId: patient.id,
      roomId: room.id,
      admissionDate: dto.admissionDate,
      expectedDischargeDate: dto.expectedDischargeDate,
      status: initialStatus,
    });

    return { booking, patientId: patient.id };
  }

  async dischargePatient(bookingId: string, dto: DischargePatientDTO): Promise<IBooking> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) throw new Error("Booking not found.");
    if (booking.status === "completed" || booking.status === "cancelled") {
      throw new Error("Patient is already discharged or booking is cancelled.");
    }

    const discharged = await this.bookingRepository.discharge(bookingId, dto.actualDischargeDate);
    if (!discharged) throw new Error("Failed to discharge patient.");
    return discharged;
  }

  async cancelBooking(bookingId: string): Promise<IBooking> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) throw new Error("Booking not found.");

    const cancelled = await this.bookingRepository.cancel(bookingId);
    if (!cancelled) throw new Error("Failed to cancel booking.");
    return cancelled;
  }

  async getTimeline(startDate: string, endDate: string): Promise<PopulatedBooking[]> {
    const allBookings = await this.bookingRepository.list();
    const rangeStart = new Date(startDate).getTime();
    const rangeEnd = new Date(endDate).getTime();

    const filtered = allBookings.filter((b) => {
      if (b.status === "cancelled") return false;
      const bStart = new Date(b.admissionDate).getTime();
      const bEnd = new Date(b.actualDischargeDate || b.expectedDischargeDate).getTime();
      return bStart <= rangeEnd && bEnd >= rangeStart;
    });

    return Promise.all(filtered.map((b) => this.populateBooking(b)));
  }
}
