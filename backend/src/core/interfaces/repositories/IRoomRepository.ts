import { IRoom, CreateRoomDTO, UpdateRoomDTO } from "../../models/Room";

export interface IRoomReader {
  findById(id: string): Promise<IRoom | null>;
  findByRoomNumber(roomNumber: string): Promise<IRoom | null>;
  list(filter?: { ward?: string; floor?: number; isUnderMaintenance?: boolean }): Promise<IRoom[]>;
}

export interface IRoomWriter {
  create(room: CreateRoomDTO): Promise<IRoom>;
  update(id: string, room: UpdateRoomDTO): Promise<IRoom | null>;
  delete(id: string): Promise<boolean>;
  setMaintenance(id: string, isUnderMaintenance: boolean): Promise<IRoom | null>;
}

export interface IRoomRepository extends IRoomReader, IRoomWriter {}
