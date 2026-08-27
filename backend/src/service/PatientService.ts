import { IPatientService, PatientWithHistoryDTO, PaginatedPatientDTOs } from "../core/interfaces/services/IPatientService";
import { IPatientRepository } from "../core/interfaces/repositories/IPatientRepository";
import { IBookingRepository } from "../core/interfaces/repositories/IBookingRepository";
import { IRoomRepository } from "../core/interfaces/repositories/IRoomRepository";
import { IPatient, CreatePatientDTO, UpdatePatientDTO } from "../core/models/Patient";
import { PopulatedBooking } from "../core/models/Booking";

export class PatientService implements IPatientService {
  constructor(
    private readonly patientRepository: IPatientRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly roomRepository: IRoomRepository
  ) {}

  private async buildPatientDTO(patient: IPatient): Promise<PatientWithHistoryDTO> {
    const bookings = await this.bookingRepository.list({ patientId: patient.id });

    const populatedBookings: PopulatedBooking[] = await Promise.all(
      bookings.map(async (b) => {
        const room = await this.roomRepository.findById(b.roomId);
        return {
          ...b,
          patient: {
            id: patient.id,
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            phone: patient.phone,
            address: patient.address,
            ailment: patient.ailment,
          },
          room: room
            ? {
                id: room.id,
                roomNumber: room.roomNumber,
                ward: room.ward,
                floor: room.floor,
                bedCount: room.bedCount,
              }
            : undefined,
        };
      })
    );

    // Check if there is an active booking right now
    const activeBooking = populatedBookings.find((b) => b.status === "active" || b.status === "reserved");

    return {
      ...patient,
      bookings: populatedBookings,
      currentRoom: activeBooking?.room
        ? {
            id: activeBooking.room.id,
            roomNumber: activeBooking.room.roomNumber,
            ward: activeBooking.room.ward,
          }
        : undefined,
    };
  }

  async getAllPatients(filter?: { search?: string; page?: number; limit?: number }): Promise<PaginatedPatientDTOs> {
    const paginated = await this.patientRepository.listPaginated(filter);
    const patients = await Promise.all(paginated.patients.map((p) => this.buildPatientDTO(p)));
    return {
      patients,
      total: paginated.total,
      page: paginated.page,
      totalPages: paginated.totalPages,
    };
  }

  async getPatientById(id: string): Promise<PatientWithHistoryDTO | null> {
    const patient = await this.patientRepository.findById(id);
    if (!patient) return null;
    return this.buildPatientDTO(patient);
  }

  async createPatient(dto: CreatePatientDTO): Promise<IPatient> {
    return this.patientRepository.create(dto);
  }

  async updatePatient(id: string, dto: UpdatePatientDTO): Promise<IPatient | null> {
    return this.patientRepository.update(id, dto);
  }

  async deletePatient(id: string): Promise<boolean> {
    const bookings = await this.bookingRepository.list({ patientId: id });
    const hasActive = bookings.some((b) => b.status === "active" || b.status === "reserved");
    if (hasActive) {
      throw new Error("Cannot delete patient who is currently admitted or has a reserved booking.");
    }
    return this.patientRepository.delete(id);
  }
}
