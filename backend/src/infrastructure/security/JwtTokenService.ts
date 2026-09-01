import jwt from "jsonwebtoken";
import { ITokenService, TokenPayload } from "../../core/interfaces/security/ITokenService";

export class JwtTokenService implements ITokenService {
  private readonly secretKey: string;
  private readonly expiresIn: string;

  constructor(secretKey: string = process.env.JWT_SECRET || "", expiresIn: string = process.env.JWT_EXPIRES_IN || "7d") {
    if (!secretKey) {
      throw new Error("JWT secret key must be defined in environment configuration.");
    }
    this.secretKey = secretKey;
    this.expiresIn = expiresIn;
  }

  generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.secretKey, { expiresIn: this.expiresIn as any });
  }

  verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.secretKey) as TokenPayload;
    } catch {
      return null;
    }
  }
}
