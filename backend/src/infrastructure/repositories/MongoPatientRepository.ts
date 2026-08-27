import { IPatientRepository } from "../../core/interfaces/repositories/IPatientRepository";
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
