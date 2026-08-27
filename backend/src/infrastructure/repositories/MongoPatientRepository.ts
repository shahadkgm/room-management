import { IPatientRepository, PaginatedPatients } from "../../core/interfaces/repositories/IPatientRepository";
import { IPatient, CreatePatientDTO, UpdatePatientDTO } from "../../core/models/Patient";
import { PatientModel } from "../database/schemas/PatientSchema";

export class MongoPatientRepository implements IPatientRepository {
  async findById(id: string): Promise<IPatient | null> {
    const doc = await PatientModel.findById(id);
    return doc ? (doc.toJSON() as IPatient) : null;
  }

  async list(filter?: { search?: string }): Promise<IPatient[]> {
    const query: any = {};
    if (filter?.search) {
      const regex = new RegExp(filter.search, "i");
      query.$or = [{ name: regex }, { phone: regex }, { ailment: regex }];
    }
    const docs = await PatientModel.find(query).sort({ createdAt: -1 });
    return docs.map((d) => d.toJSON() as IPatient);
  }

  async listPaginated(filter?: { search?: string; page?: number; limit?: number }): Promise<PaginatedPatients> {
    const query: any = {};
    if (filter?.search) {
      const regex = new RegExp(filter.search, "i");
      query.$or = [{ name: regex }, { phone: regex }, { ailment: regex }];
    }
    const page = filter?.page && filter.page > 0 ? filter.page : 1;
    const limit = filter?.limit && filter.limit > 0 ? filter.limit : 10;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      PatientModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      PatientModel.countDocuments(query),
    ]);

    return {
      patients: docs.map((d) => d.toJSON() as IPatient),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(patient: CreatePatientDTO): Promise<IPatient> {
    const doc = await PatientModel.create(patient);
    return doc.toJSON() as IPatient;
  }

  async update(id: string, patient: UpdatePatientDTO): Promise<IPatient | null> {
    const doc = await PatientModel.findByIdAndUpdate(id, patient, { new: true });
    return doc ? (doc.toJSON() as IPatient) : null;
  }

  async delete(id: string): Promise<boolean> {
    const res = await PatientModel.findByIdAndDelete(id);
    return !!res;
  }
}
