import { Request, Response, NextFunction } from "express";
import { ITokenService } from "../core/interfaces/security/ITokenService";
import { UserRole } from "../core/models/User";

export function createAuthMiddleware(tokenService: ITokenService) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, message: "No token provided. Please authenticate." });
      return;
    }

    const token = authHeader.split(" ")[1];
    const payload = tokenService.verifyToken(token);
    if (!payload) {
      res.status(401).json({ success: false, message: "Invalid or expired token." });
      return;
    }

    (req as any).user = payload;
    next();
  };
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    if (!user || !allowedRoles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to perform this action.",
      });
      return;
    }
    next();
  };
}
