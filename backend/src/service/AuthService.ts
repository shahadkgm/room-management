import { IAuthService, RegisterUserDTO, LoginDTO, AuthResponseDTO } from "../core/interfaces/services/IAuthService";
import { IUserRepository } from "../core/interfaces/repositories/IUserRepository";
import { IPasswordHasher } from "../core/interfaces/security/IPasswordHasher";
import { ITokenService } from "../core/interfaces/security/ITokenService";
import { UserDTO } from "../core/models/User";

export class AuthService implements IAuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService
  ) {}

  async register(dto: RegisterUserDTO): Promise<AuthResponseDTO> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new Error("A user with this email already exists.");
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);
    const user = await this.userRepository.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash,
      role: dto.role || "receptionist",
      isAllowed: false,
    });

    const userDTO: UserDTO = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAllowed: user.isAllowed ?? true,
    };

    const token = this.tokenService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return { token, user: userDTO };
  }

  async login(dto: LoginDTO): Promise<AuthResponseDTO> {
    let searchEmail = dto.email.trim().toLowerCase();

    // Map common role shortcuts to configured emails from environment variables
    const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const recEmail = (process.env.RECEPTIONIST_EMAIL || "").trim().toLowerCase();
    const visEmail = (process.env.VISITOR_EMAIL || "").trim().toLowerCase();

    if (searchEmail === "admin" && adminEmail) {
      searchEmail = adminEmail;
    } else if ((searchEmail === "receptionist" || searchEmail === "staff") && recEmail) {
      searchEmail = recEmail;
    } else if ((searchEmail === "visitor" || searchEmail === "guest") && visEmail) {
      searchEmail = visEmail;
    }

    let user = await this.userRepository.findByEmail(searchEmail);
    if (!user) {
      const allUsers = await this.userRepository.list();
      user = allUsers.find(
        (u) =>
          u.email.toLowerCase() === searchEmail ||
          u.name.toLowerCase().includes(searchEmail)
      ) || null;
    }

    if (!user) {
      throw new Error("Invalid username/email or password.");
    }

    // Security Check: isAllowed flag
    if (user.isAllowed === false) {
      throw new Error("Access Denied: Your account is not allowed to sign in. Please contact system administrator.");
    }

    const isMatch = await this.passwordHasher.compare(dto.password, user.passwordHash);

    if (!isMatch) {
      throw new Error("Invalid username/email or password.");
    }

    const userDTO: UserDTO = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAllowed: user.isAllowed ?? true,
    };

    const token = this.tokenService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return { token, user: userDTO };
  }

  async getCurrentUser(userId: string): Promise<UserDTO | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAllowed: user.isAllowed ?? true,
    };
  }
}
