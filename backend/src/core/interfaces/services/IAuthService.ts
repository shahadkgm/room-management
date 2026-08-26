import { IUser, UserDTO, UserRole } from "../../models/User";

export interface RegisterUserDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponseDTO {
  token: string;
  user: UserDTO;
}

export interface IAuthService {
  register(dto: RegisterUserDTO): Promise<AuthResponseDTO>;
  login(dto: LoginDTO): Promise<AuthResponseDTO>;
  getCurrentUser(userId: string): Promise<UserDTO | null>;
}
