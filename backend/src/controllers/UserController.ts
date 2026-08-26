import { Request, Response } from "express";
import { IUserRepository } from "../core/interfaces/repositories/IUserRepository";

export class UserController {
  constructor(private readonly userRepository: IUserRepository) {}

  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.userRepository.list();
      // Remove passwordHash from response
      const safeUsers = users.map(user => {
        const { passwordHash, ...safeUser } = user as any;
        return safeUser;
      });
      res.status(200).json({ success: true, data: safeUsers });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  updateUserAllowance = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { isAllowed } = req.body;
      
      if (typeof isAllowed !== "boolean") {
        res.status(400).json({ success: false, message: "isAllowed must be a boolean" });
        return;
      }

      const updated = await this.userRepository.update(id, { isAllowed });
      if (!updated) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      const { passwordHash, ...safeUser } = updated as any;
      res.status(200).json({ success: true, data: safeUser });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      
      // Prevent deleting self
      if (id === (req as any).user?.userId) {
        res.status(400).json({ success: false, message: "Cannot delete your own account" });
        return;
      }

      const deleted = await this.userRepository.delete(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
