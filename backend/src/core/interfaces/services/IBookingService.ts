import { IBooking, CreateBookingDTO, DirectAdmissionDTO, DischargePatientDTO, PopulatedBooking } from "../../models/Booking";

export interface IBookingService {
  getAllBookings(filter?: { status?: string; roomId?: string; patientId?: string }): Promise<PopulatedBooking[]>;
  getBookingById(id: string): Promise<PopulatedBooking | null>;
  createBooking(dto: CreateBookingDTO): Promise<IBooking>;
  directAdmitPatient(dto: DirectAdmissionDTO): Promise<{ booking: IBooking; patientId: string }>;
  dischargePatient(bookingId: string, dto: DischargePatientDTO): Promise<IBooking>;
  cancelBooking(bookingId: string): Promise<IBooking>;
  updateBooking(bookingId: string, dto: { admissionDate: string; expectedDischargeDate: string }): Promise<IBooking>;
  getTimeline(startDate: string, endDate: string): Promise<PopulatedBooking[]>;
}
