export type UserRole = "admin" | "receptionist" | "visitor";

export interface IUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isAllowed?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isAllowed?: boolean;
}
