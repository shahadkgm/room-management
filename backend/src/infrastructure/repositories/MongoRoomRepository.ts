import { IRoomRepository } from "../../core/interfaces/repositories/IRoomRepository";
import { IRoom, CreateRoomDTO, UpdateRoomDTO } from "../../core/models/Room";
import { RoomModel } from "../database/schemas/RoomSchema";

export class MongoRoomRepository implements IRoomRepository {
  async findById(id: string): Promise<IRoom | null> {
    const doc = await RoomModel.findById(id);
    return doc ? (doc.toJSON() as IRoom) : null;
  }

  async findByRoomNumber(roomNumber: string): Promise<IRoom | null> {
    const doc = await RoomModel.findOne({ roomNumber });
    return doc ? (doc.toJSON() as IRoom) : null;
  }

  async list(filter?: { ward?: string; floor?: number; isUnderMaintenance?: boolean }): Promise<IRoom[]> {
    const query: any = {};
    if (filter?.ward) query.ward = filter.ward;
    if (filter?.floor !== undefined) query.floor = filter.floor;
    if (filter?.isUnderMaintenance !== undefined) query.isUnderMaintenance = filter.isUnderMaintenance;

    const docs = await RoomModel.find(query).sort({ floor: 1, roomNumber: 1 });
    return docs.map((d) => d.toJSON() as IRoom);
  }

  async create(room: CreateRoomDTO): Promise<IRoom> {
    const doc = await RoomModel.create({
      ...room,
      amenities: room.amenities || [],
      isUnderMaintenance: room.isUnderMaintenance || false,
    });
    return doc.toJSON() as IRoom;
  }

  async update(id: string, room: UpdateRoomDTO): Promise<IRoom | null> {
    const doc = await RoomModel.findByIdAndUpdate(id, room, { new: true });
    return doc ? (doc.toJSON() as IRoom) : null;
  }

  async delete(id: string): Promise<boolean> {
    const res = await RoomModel.findByIdAndDelete(id);
    return !!res;
  }

  async setMaintenance(id: string, isUnderMaintenance: boolean): Promise<IRoom | null> {
    const doc = await RoomModel.findByIdAndUpdate(id, { isUnderMaintenance }, { new: true });
    return doc ? (doc.toJSON() as IRoom) : null;
  }
}
