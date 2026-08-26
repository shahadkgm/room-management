import { IPatient, CreatePatientDTO, UpdatePatientDTO } from "../../models/Patient";

export interface IPatientReader {
  findById(id: string): Promise<IPatient | null>;
  list(filter?: { search?: string }): Promise<IPatient[]>;
}

export interface IPatientWriter {
  create(patient: CreatePatientDTO): Promise<IPatient>;
  update(id: string, patient: UpdatePatientDTO): Promise<IPatient | null>;
  delete(id: string): Promise<boolean>;
}

export interface IPatientRepository extends IPatientReader, IPatientWriter {}
