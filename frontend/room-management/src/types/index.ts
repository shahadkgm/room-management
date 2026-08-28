export type UserRole = "admin" | "receptionist" | "visitor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "receptionist" | "visitor";
  isAllowed: boolean;
}

export type RoomStatus = "available" | "occupied" | "reserved" | "maintenance";

export interface Room {
  id: string;
  roomNumber: string;
  ward: string;
  floor: number;
  bedCount: number;
  amenities: string[];
  isUnderMaintenance: boolean;
  status: RoomStatus;
  createdAt: string;
  updatedAt: string;
}

export type Gender = "male" | "female" | "other";

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  address: string;
  ailment: string;
  createdAt: string;
  updatedAt: string;
  bookings?: Booking[];
  currentRoom?: {
    id: string;
    roomNumber: string;
    ward: string;
  };
}

export type BookingStatus = "active" | "reserved" | "completed" | "cancelled";

export interface Booking {
  id: string;
  patientId: string;
  roomId: string;
  admissionDate: string;
  expectedDischargeDate: string;
  actualDischargeDate?: string;
  status: BookingStatus;
  patient?: {
    id: string;
    name: string;
    age: number;
    gender: string;
    phone: string;
    address: string;
    ailment: string;
  };
  room?: {
    id: string;
    roomNumber: string;
    ward: string;
    floor: number;
    bedCount: number;
  };
}

export interface RoomWithBookings extends Room {
  activeBookings: Booking[];
  upcomingBookings: Booking[];
}

export interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  reservedRooms: number;
  maintenanceRooms: number;
  expectedAdmissionsToday: number;
  expectedDischargesToday: number;
  admissionsTodayList: Booking[];
  dischargesTodayList: Booking[];
  overdueDischargesList: Booking[];
}
