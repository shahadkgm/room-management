export type Gender = "male" | "female" | "other";

export interface IPatient {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  address: string;
  ailment: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePatientDTO {
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  address: string;
  ailment: string;
  notes?: string;
}

export interface UpdatePatientDTO {
  name?: string;
  age?: number;
  gender?: Gender;
  phone?: string;
  address?: string;
  ailment?: string;
  notes?: string;
}
