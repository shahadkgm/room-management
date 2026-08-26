import { UserRole } from "../../models/User";

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface ITokenService {
  generateToken(payload: TokenPayload): string;
  verifyToken(token: string): TokenPayload | null;
}
