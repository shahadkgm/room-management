import { IRoomRepository } from "../../core/interfaces/repositories/IRoomRepository";
import { IRoom, CreateRoomDTO, UpdateRoomDTO } from "../../core/models/Room";

export class InMemoryRoomRepository implements IRoomRepository {
  private rooms: Map<string, IRoom> = new Map();

  async findById(id: string): Promise<IRoom | null> {
    return this.rooms.get(id) || null;
  }

  async findByRoomNumber(roomNumber: string): Promise<IRoom | null> {
    for (const r of this.rooms.values()) {
      if (r.roomNumber === roomNumber) {
        return r;
      }
    }
    return null;
  }

  async list(filter?: { ward?: string; floor?: number; isUnderMaintenance?: boolean }): Promise<IRoom[]> {
    let result = Array.from(this.rooms.values());

    if (filter?.ward) {
      result = result.filter((r) => r.ward.toLowerCase() === filter.ward!.toLowerCase());
    }
    if (filter?.floor !== undefined) {
      result = result.filter((r) => r.floor === filter.floor);
    }
    if (filter?.isUnderMaintenance !== undefined) {
      result = result.filter((r) => r.isUnderMaintenance === filter.isUnderMaintenance);
    }

    return result.sort((a, b) => {
      if (a.floor !== b.floor) return a.floor - b.floor;
      return a.roomNumber.localeCompare(b.roomNumber);
    });
  }

  async create(room: CreateRoomDTO): Promise<IRoom> {
    const id = "rm_" + Math.random().toString(36).substring(2, 9) + Date.now();
    const now = new Date();
    const newRoom: IRoom = {
      id,
      roomNumber: room.roomNumber,
      ward: room.ward,
      floor: room.floor,
      bedCount: room.bedCount,
      amenities: room.amenities || [],
      isUnderMaintenance: room.isUnderMaintenance || false,
      createdAt: now,
      updatedAt: now,
    };
    this.rooms.set(id, newRoom);
    return newRoom;
  }

  async update(id: string, room: UpdateRoomDTO): Promise<IRoom | null> {
    const existing = this.rooms.get(id);
    if (!existing) return null;
    const updated: IRoom = {
      ...existing,
      ...room,
      updatedAt: new Date(),
    };
    this.rooms.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.rooms.delete(id);
  }

  async setMaintenance(id: string, isUnderMaintenance: boolean): Promise<IRoom | null> {
    return this.update(id, { isUnderMaintenance });
  }
}
