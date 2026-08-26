import { Request, Response } from "express";
import { IDashboardService } from "../core/interfaces/services/IDashboardService";

export class DashboardController {
  constructor(private readonly dashboardService: IDashboardService) {}

  getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { date } = req.query;
      const stats = await this.dashboardService.getStats(date ? String(date) : undefined);
      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
