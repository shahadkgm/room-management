import { IUser } from "../../models/User";

export interface IUserReader {
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  list(): Promise<IUser[]>;
}

export interface IUserWriter {
  create(user: Omit<IUser, "id" | "createdAt" | "updatedAt">): Promise<IUser>;
  update(id: string, user: Partial<IUser>): Promise<IUser | null>;
  delete(id: string): Promise<boolean>;
}

export interface IUserRepository extends IUserReader, IUserWriter {}
