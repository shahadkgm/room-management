import { Request, Response } from "express";
import { IAuthService } from "../core/interfaces/services/IAuthService";

export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password) {
        res.status(400).json({ success: false, message: "Name, email and password are required." });
        return;
      }

      const result = await this.authService.register({ name, email, password, role });
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ success: false, message: "Email and password are required." });
        return;
      }

      const result = await this.authService.login({ email, password });
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message });
    }
  };

  getMe = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const user = await this.authService.getCurrentUser(userId);
      if (!user) {
        res.status(404).json({ success: false, message: "User not found." });
        return;
      }

      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
