import { IBookingRepository } from "../../core/interfaces/repositories/IBookingRepository";
import { IBooking, CreateBookingDTO, BookingStatus } from "../../core/models/Booking";
import { BookingModel } from "../database/schemas/BookingSchema";

export class MongoBookingRepository implements IBookingRepository {
  async findById(id: string): Promise<IBooking | null> {
    const doc = await BookingModel.findById(id);
    return doc ? (doc.toJSON() as IBooking) : null;
  }

  async list(filter?: { status?: BookingStatus; roomId?: string; patientId?: string }): Promise<IBooking[]> {
    const query: any = {};
    if (filter?.status) query.status = filter.status;
    if (filter?.roomId) query.roomId = filter.roomId;
    if (filter?.patientId) query.patientId = filter.patientId;

    const docs = await BookingModel.find(query).sort({ admissionDate: -1 });
    return docs.map((d) => d.toJSON() as IBooking);
  }

  async findByRoomId(roomId: string): Promise<IBooking[]> {
    const docs = await BookingModel.find({ roomId }).sort({ admissionDate: 1 });
    return docs.map((d) => d.toJSON() as IBooking);
  }

  async findActiveAndReserved(): Promise<IBooking[]> {
    const docs = await BookingModel.find({
      status: { $in: ["active", "reserved"] },
    }).sort({ admissionDate: 1 });
    return docs.map((d) => d.toJSON() as IBooking);
  }

  async create(booking: CreateBookingDTO & { status: BookingStatus }): Promise<IBooking> {
    const doc = await BookingModel.create({
      ...booking,
    });
    return doc.toJSON() as IBooking;
  }

  async update(id: string, updateData: Partial<IBooking>): Promise<IBooking | null> {
    const doc = await BookingModel.findByIdAndUpdate(id, updateData, { new: true });
    return doc ? (doc.toJSON() as IBooking) : null;
  }

  async discharge(id: string, actualDischargeDate: string): Promise<IBooking | null> {
    const existing = await BookingModel.findById(id);
    if (!existing) return null;

    const doc = await BookingModel.findByIdAndUpdate(
      id,
      {
        actualDischargeDate,
        status: "completed",
      },
      { new: true }
    );
    return doc ? (doc.toJSON() as IBooking) : null;
  }

  async cancel(id: string): Promise<IBooking | null> {
    const doc = await BookingModel.findByIdAndUpdate(id, { status: "cancelled" }, { new: true });
    return doc ? (doc.toJSON() as IBooking) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await BookingModel.findByIdAndDelete(id);
    return result !== null;
  }
}
