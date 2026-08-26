import { IRoomService, RoomWithBookingsDTO } from "../core/interfaces/services/IRoomService";
import { IRoomRepository } from "../core/interfaces/repositories/IRoomRepository";
import { IBookingRepository } from "../core/interfaces/repositories/IBookingRepository";
import { IPatientRepository } from "../core/interfaces/repositories/IPatientRepository";
import { IRoomStatusCalculator } from "../core/interfaces/strategies/IRoomStatusCalculator";
import { IRoom, CreateRoomDTO, UpdateRoomDTO } from "../core/models/Room";
import { PopulatedBooking } from "../core/models/Booking";

import { CacheService } from "../infrastructure/cache/CacheService";

export class RoomService implements IRoomService {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly patientRepository: IPatientRepository,
    private readonly statusCalculator: IRoomStatusCalculator
  ) {}

  async getAllRooms(filter?: { ward?: string; floor?: number }): Promise<IRoom[]> {
    const cacheKey = `rooms_all_${filter?.ward || "all"}_${filter?.floor ?? "all"}`;
    const cached = CacheService.getInstance().get<IRoom[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const rooms = await this.roomRepository.list(filter);
    const allActiveAndReservedBookings = await this.bookingRepository.findActiveAndReserved();

    // Dynamically compute real-time status for each room based on bookings and maintenance state
    const result = rooms.map((room) => {
      const bookingsForRoom = allActiveAndReservedBookings.filter((b) => b.roomId === room.id);
      const computedStatus = this.statusCalculator.computeStatus(room, bookingsForRoom);
      return {
        ...room,
        status: computedStatus,
      };
    });

    CacheService.getInstance().set(cacheKey, result, 15);
    return result;
  }

  async getRoomById(id: string): Promise<RoomWithBookingsDTO | null> {
    const room = await this.roomRepository.findById(id);
    if (!room) return null;

    const bookings = await this.bookingRepository.findByRoomId(id);
    const computedStatus = this.statusCalculator.computeStatus(room, bookings);

    const todayStr = new Date().toISOString().split("T")[0];
    const todayTime = new Date(todayStr).getTime();

    // Populate patient info for bookings
    const populatedBookings: PopulatedBooking[] = await Promise.all(
      bookings.map(async (b) => {
        const patient = await this.patientRepository.findById(b.patientId);
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
                notes: patient.notes,
              }
            : undefined,
          room: {
            id: room.id,
            roomNumber: room.roomNumber,
            ward: room.ward,
            floor: room.floor,
            bedCount: room.bedCount,
            dailyRate: room.dailyRate,
          },
        };
      })
    );

    const activeBookings = populatedBookings.filter((b) => {
      if (b.status === "cancelled" || b.status === "completed") return false;
      const start = new Date(b.admissionDate).getTime();
      const end = new Date(b.actualDischargeDate || b.expectedDischargeDate).getTime();
      return todayTime >= start && todayTime < end;
    });

    const upcomingBookings = populatedBookings.filter((b) => {
      if (b.status === "cancelled" || b.status === "completed") return false;
      const start = new Date(b.admissionDate).getTime();
      return start > todayTime;
    });

    return {
      ...room,
      status: computedStatus,
      activeBookings,
      upcomingBookings,
    };
  }

  async createRoom(dto: CreateRoomDTO): Promise<IRoom> {
    const existing = await this.roomRepository.findByRoomNumber(dto.roomNumber);
    if (existing) {
      throw new Error(`Room number "${dto.roomNumber}" already exists.`);
    }

    const room = await this.roomRepository.create(dto);
    CacheService.getInstance().flushPattern("rooms");
    CacheService.getInstance().flushPattern("dashboard");

    return {
      ...room,
      status: room.isUnderMaintenance ? "maintenance" : "available",
    };
  }

  async updateRoom(id: string, dto: UpdateRoomDTO): Promise<IRoom | null> {
    if (dto.roomNumber) {
      const existing = await this.roomRepository.findByRoomNumber(dto.roomNumber);
      if (existing && existing.id !== id) {
        throw new Error(`Room number "${dto.roomNumber}" is already in use by another room.`);
      }
    }

    const updated = await this.roomRepository.update(id, dto);
    if (!updated) return null;

    CacheService.getInstance().flushPattern("rooms");
    CacheService.getInstance().flushPattern("dashboard");

    const bookings = await this.bookingRepository.findByRoomId(id);
    const status = this.statusCalculator.computeStatus(updated, bookings);
    return { ...updated, status };
  }

  async deleteRoom(id: string): Promise<boolean> {
    const bookings = await this.bookingRepository.findByRoomId(id);
    const hasActiveBookings = bookings.some((b) => b.status === "active" || b.status === "reserved");
    if (hasActiveBookings) {
      throw new Error("Cannot delete room with active or reserved bookings.");
    }

    const deleted = await this.roomRepository.delete(id);
    if (deleted) {
      CacheService.getInstance().flushPattern("rooms");
      CacheService.getInstance().flushPattern("dashboard");
    }
    return deleted;
  }

  async setRoomMaintenance(id: string, isUnderMaintenance: boolean): Promise<IRoom | null> {
    const room = await this.roomRepository.findById(id);
    if (!room) throw new Error("Room not found.");

    if (isUnderMaintenance) {
      const bookings = await this.bookingRepository.findByRoomId(id);
      const active = bookings.some((b) => b.status === "active");
      if (active) {
        throw new Error("Cannot put room under maintenance while an active booking exists.");
      }
    }

    const updated = await this.roomRepository.setMaintenance(id, isUnderMaintenance);
    if (!updated) return null;

    CacheService.getInstance().flushPattern("rooms");
    CacheService.getInstance().flushPattern("dashboard");

    const bookings = await this.bookingRepository.findByRoomId(id);
    const status = this.statusCalculator.computeStatus(updated, bookings);
    return { ...updated, status };
  }
}
