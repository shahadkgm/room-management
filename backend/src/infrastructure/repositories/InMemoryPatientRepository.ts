import { IPatientRepository } from "../../core/interfaces/repositories/IPatientRepository";
import { IPatient, CreatePatientDTO, UpdatePatientDTO } from "../../core/models/Patient";

export class InMemoryPatientRepository implements IPatientRepository {
  private patients: Map<string, IPatient> = new Map();

  async findById(id: string): Promise<IPatient | null> {
    return this.patients.get(id) || null;
  }

  async list(filter?: { search?: string }): Promise<IPatient[]> {
    let result = Array.from(this.patients.values());

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.ailment.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async create(patient: CreatePatientDTO): Promise<IPatient> {
    const id = "pat_" + Math.random().toString(36).substring(2, 9) + Date.now();
    const now = new Date();
    const newPatient: IPatient = {
      id,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      address: patient.address,
      ailment: patient.ailment,
      notes: patient.notes || "",
      createdAt: now,
      updatedAt: now,
    };
    this.patients.set(id, newPatient);
    return newPatient;
  }

  async update(id: string, patient: UpdatePatientDTO): Promise<IPatient | null> {
    const existing = this.patients.get(id);
    if (!existing) return null;
    const updated: IPatient = {
      ...existing,
      ...patient,
      updatedAt: new Date(),
    };
    this.patients.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.patients.delete(id);
  }
}
