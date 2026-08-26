import { IBookingRepository } from "../../core/interfaces/repositories/IBookingRepository";
import { IBooking, CreateBookingDTO, BookingStatus } from "../../core/models/Booking";

export class InMemoryBookingRepository implements IBookingRepository {
  private bookings: Map<string, IBooking> = new Map();

  async findById(id: string): Promise<IBooking | null> {
    return this.bookings.get(id) || null;
  }

  async list(filter?: { status?: BookingStatus; roomId?: string; patientId?: string }): Promise<IBooking[]> {
    let result = Array.from(this.bookings.values());

    if (filter?.status) {
      result = result.filter((b) => b.status === filter.status);
    }
    if (filter?.roomId) {
      result = result.filter((b) => b.roomId === filter.roomId);
    }
    if (filter?.patientId) {
      result = result.filter((b) => b.patientId === filter.patientId);
    }

    return result.sort((a, b) => new Date(b.admissionDate).getTime() - new Date(a.admissionDate).getTime());
  }

  async findByRoomId(roomId: string): Promise<IBooking[]> {
    return Array.from(this.bookings.values())
      .filter((b) => b.roomId === roomId)
      .sort((a, b) => new Date(a.admissionDate).getTime() - new Date(b.admissionDate).getTime());
  }

  async findActiveAndReserved(): Promise<IBooking[]> {
    return Array.from(this.bookings.values())
      .filter((b) => b.status === "active" || b.status === "reserved")
      .sort((a, b) => new Date(a.admissionDate).getTime() - new Date(b.admissionDate).getTime());
  }

  async create(booking: CreateBookingDTO & { status: BookingStatus }): Promise<IBooking> {
    const id = "bk_" + Math.random().toString(36).substring(2, 9) + Date.now();
    const now = new Date();
    const newBooking: IBooking = {
      id,
      patientId: booking.patientId,
      roomId: booking.roomId,
      admissionDate: booking.admissionDate,
      expectedDischargeDate: booking.expectedDischargeDate,
      status: booking.status,
      createdAt: now,
      updatedAt: now,
    };
    this.bookings.set(id, newBooking);
    return newBooking;
  }

  async update(id: string, updateData: Partial<IBooking>): Promise<IBooking | null> {
    const existing = this.bookings.get(id);
    if (!existing) return null;
    const updated: IBooking = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    this.bookings.set(id, updated);
    return updated;
  }

  async discharge(id: string, actualDischargeDate: string): Promise<IBooking | null> {
    const existing = this.bookings.get(id);
    if (!existing) return null;

    const updated: IBooking = {
      ...existing,
      actualDischargeDate,
      status: "completed",
      updatedAt: new Date(),
    };
    this.bookings.set(id, updated);
    return updated;
  }

  async cancel(id: string): Promise<IBooking | null> {
    const existing = this.bookings.get(id);
    if (!existing) return null;
    const updated: IBooking = {
      ...existing,
      status: "cancelled",
      updatedAt: new Date(),
    };
    this.bookings.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.bookings.delete(id);
  }
}
