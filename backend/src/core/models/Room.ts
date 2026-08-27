export type RoomStatus = "available" | "occupied" | "reserved" | "maintenance";

export interface IRoom {
  id: string;
  roomNumber: string;
  ward: string;
  floor: number;
  bedCount: number;
  amenities: string[];
  isUnderMaintenance: boolean;
  status?: RoomStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoomDTO {
  roomNumber: string;
  ward: string;
  floor: number;
  bedCount: number;
  amenities?: string[];
  isUnderMaintenance?: boolean;
}

export interface UpdateRoomDTO {
  roomNumber?: string;
  ward?: string;
  floor?: number;
  bedCount?: number;
  amenities?: string[];
  isUnderMaintenance?: boolean;
}
