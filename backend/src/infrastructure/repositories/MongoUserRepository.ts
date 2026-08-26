import { IUserRepository } from "../../core/interfaces/repositories/IUserRepository";
import { IUser } from "../../core/models/User";
import { UserModel } from "../database/schemas/UserSchema";

export class MongoUserRepository implements IUserRepository {
  async findById(id: string): Promise<IUser | null> {
    const doc = await UserModel.findById(id);
    return doc ? (doc.toJSON() as IUser) : null;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() });
    return doc ? (doc.toJSON() as IUser) : null;
  }

  async list(): Promise<IUser[]> {
    const docs = await UserModel.find();
    return docs.map((d) => d.toJSON() as IUser);
  }

  async create(user: Omit<IUser, "id" | "createdAt" | "updatedAt">): Promise<IUser> {
    const doc = await UserModel.create(user);
    return doc.toJSON() as IUser;
  }

  async update(id: string, user: Partial<IUser>): Promise<IUser | null> {
    const doc = await UserModel.findByIdAndUpdate(id, user, { new: true });
    return doc ? (doc.toJSON() as IUser) : null;
  }

  async delete(id: string): Promise<boolean> {
    const res = await UserModel.findByIdAndDelete(id);
    return !!res;
  }
}
