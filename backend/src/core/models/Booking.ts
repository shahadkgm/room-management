export type BookingStatus = "active" | "reserved" | "completed" | "cancelled";

export interface IBooking {
  id: string;
  patientId: string;
  roomId: string;
  admissionDate: string; // YYYY-MM-DD
  expectedDischargeDate: string; // YYYY-MM-DD
  actualDischargeDate?: string; // YYYY-MM-DD
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingDTO {
  patientId: string;
  roomId: string;
  admissionDate: string;
  expectedDischargeDate: string;
}

export interface DirectAdmissionDTO {
  patient: {
    name: string;
    age: number;
    gender: "male" | "female" | "other";
    phone: string;
    address: string;
    ailment?: string;
  };
  roomId: string;
  admissionDate: string;
  expectedDischargeDate: string;
}

export interface DischargePatientDTO {
  actualDischargeDate: string;
}

export interface PopulatedBooking extends IBooking {
  patient?: {
    id: string;
    name: string;
    age: number;
    gender: string;
    phone: string;
    address: string;
    ailment?: string;
  };
  room?: {
    id: string;
    roomNumber: string;
    ward: string;
    floor: number;
    bedCount: number;
  };
}
