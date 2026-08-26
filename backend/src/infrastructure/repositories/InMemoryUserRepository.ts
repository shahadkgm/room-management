import { IUserRepository } from "../../core/interfaces/repositories/IUserRepository";
import { IUser } from "../../core/models/User";

export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, IUser> = new Map();

  async findById(id: string): Promise<IUser | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return u;
      }
    }
    return null;
  }

  async list(): Promise<IUser[]> {
    return Array.from(this.users.values());
  }

  async create(user: Omit<IUser, "id" | "createdAt" | "updatedAt">): Promise<IUser> {
    const id = "usr_" + Math.random().toString(36).substring(2, 9) + Date.now();
    const now = new Date();
    const newUser: IUser = {
      id,
      ...user,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async update(id: string, user: Partial<IUser>): Promise<IUser | null> {
    const existing = this.users.get(id);
    if (!existing) return null;
    const updated: IUser = {
      ...existing,
      ...user,
      updatedAt: new Date(),
    };
    this.users.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }
}
