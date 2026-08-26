export type BookingStatus = "active" | "reserved" | "completed" | "cancelled";

export interface IBooking {
  id: string;
  patientId: string;
  roomId: string;
  admissionDate: string; // YYYY-MM-DD
  expectedDischargeDate: string; // YYYY-MM-DD
  actualDischargeDate?: string; // YYYY-MM-DD
  status: BookingStatus;
  notes?: string;
  dailyRate: number;
  totalAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingDTO {
  patientId: string;
  roomId: string;
  admissionDate: string;
  expectedDischargeDate: string;
  notes?: string;
  dailyRate?: number;
}

export interface DirectAdmissionDTO {
  patient: {
    name: string;
    age: number;
    gender: "male" | "female" | "other";
    phone: string;
    address: string;
    ailment: string;
    notes?: string;
  };
  roomId: string;
  admissionDate: string;
  expectedDischargeDate: string;
  notes?: string;
}

export interface DischargePatientDTO {
  actualDischargeDate: string;
  notes?: string;
}

export interface PopulatedBooking extends IBooking {
  patient?: {
    id: string;
    name: string;
    age: number;
    gender: string;
    phone: string;
    address: string;
    ailment: string;
    notes?: string;
  };
  room?: {
    id: string;
    roomNumber: string;
    ward: string;
    floor: number;
    bedCount: number;
    dailyRate: number;
  };
}
