import { IRoom, CreateRoomDTO, UpdateRoomDTO } from "../../models/Room";
import { PopulatedBooking } from "../../models/Booking";

export interface RoomWithBookingsDTO extends IRoom {
  activeBookings: PopulatedBooking[];
  upcomingBookings: PopulatedBooking[];
}

export interface IRoomService {
  getAllRooms(filter?: { ward?: string; floor?: number }): Promise<IRoom[]>;
  getRoomById(id: string): Promise<RoomWithBookingsDTO | null>;
  createRoom(dto: CreateRoomDTO): Promise<IRoom>;
  updateRoom(id: string, dto: UpdateRoomDTO): Promise<IRoom | null>;
  deleteRoom(id: string): Promise<boolean>;
  setRoomMaintenance(id: string, isUnderMaintenance: boolean): Promise<IRoom | null>;
}
