import { IPatient, CreatePatientDTO, UpdatePatientDTO } from "../../models/Patient";
import { PopulatedBooking } from "../../models/Booking";

export interface PatientWithHistoryDTO extends IPatient {
  bookings: PopulatedBooking[];
  currentRoom?: {
    id: string;
    roomNumber: string;
    ward: string;
  };
}

export interface IPatientService {
  getAllPatients(filter?: { search?: string }): Promise<PatientWithHistoryDTO[]>;
  getPatientById(id: string): Promise<PatientWithHistoryDTO | null>;
  createPatient(dto: CreatePatientDTO): Promise<IPatient>;
  updatePatient(id: string, dto: UpdatePatientDTO): Promise<IPatient | null>;
  deletePatient(id: string): Promise<boolean>;
}
