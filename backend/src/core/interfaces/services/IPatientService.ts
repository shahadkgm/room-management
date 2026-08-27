import { IPatient, CreatePatientDTO, UpdatePatientDTO } from "../../models/Patient";
import { PopulatedBooking } from "../../models/Booking";
import { PaginatedPatients } from "../repositories/IPatientRepository";

export interface PaginatedPatientDTOs {
  patients: PatientWithHistoryDTO[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PatientWithHistoryDTO extends IPatient {
  bookings: PopulatedBooking[];
  currentRoom?: {
    id: string;
    roomNumber: string;
    ward: string;
  };
}

export interface IPatientService {
  getAllPatients(filter?: { search?: string; page?: number; limit?: number }): Promise<PaginatedPatientDTOs>;
  getPatientById(id: string): Promise<PatientWithHistoryDTO | null>;
  createPatient(dto: CreatePatientDTO): Promise<IPatient>;
  updatePatient(id: string, dto: UpdatePatientDTO): Promise<IPatient | null>;
  deletePatient(id: string): Promise<boolean>;
}
