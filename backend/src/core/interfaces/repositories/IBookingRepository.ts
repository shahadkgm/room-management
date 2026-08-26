import { IBooking, CreateBookingDTO, BookingStatus } from "../../models/Booking";

export interface IBookingReader {
  findById(id: string): Promise<IBooking | null>;
  list(filter?: { status?: BookingStatus; roomId?: string; patientId?: string }): Promise<IBooking[]>;
  findByRoomId(roomId: string): Promise<IBooking[]>;
  findActiveAndReserved(): Promise<IBooking[]>;
}

export interface IBookingWriter {
  create(booking: CreateBookingDTO & { status: BookingStatus }): Promise<IBooking>;
  update(id: string, updateData: Partial<IBooking>): Promise<IBooking | null>;
  discharge(id: string, actualDischargeDate: string): Promise<IBooking | null>;
  cancel(id: string): Promise<IBooking | null>;
  delete(id: string): Promise<boolean>;
}

export interface IBookingRepository extends IBookingReader, IBookingWriter {}
