import { PopulatedBooking } from "../../models/Booking";

export interface DashboardStatsDTO {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  reservedRooms: number;
  maintenanceRooms: number;
  expectedAdmissionsToday: number;
  expectedDischargesToday: number;
  admissionsTodayList: PopulatedBooking[];
  dischargesTodayList: PopulatedBooking[];
  overdueDischargesList: PopulatedBooking[];
}

export interface IDashboardService {
  getStats(referenceDate?: string): Promise<DashboardStatsDTO>;
}
