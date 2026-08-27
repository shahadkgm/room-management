import { Request, Response } from "express";
import { IBookingService } from "../core/interfaces/services/IBookingService";

export class BookingController {
  constructor(private readonly bookingService: IBookingService) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, roomId, patientId } = req.query;
      const bookings = await this.bookingService.getAllBookings({
        status: status as any,
        roomId: roomId ? String(roomId) : undefined,
        patientId: patientId ? String(patientId) : undefined,
      });
      res.status(200).json({ success: true, data: bookings });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const booking = await this.bookingService.getBookingById(id);
      if (!booking) {
        res.status(404).json({ success: false, message: "Booking not found." });
        return;
      }
      res.status(200).json({ success: true, data: booking });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { patientId, roomId, admissionDate, expectedDischargeDate } = req.body;
      if (!patientId || !roomId || !admissionDate || !expectedDischargeDate) {
        res.status(400).json({
          success: false,
          message: "patientId, roomId, admissionDate, and expectedDischargeDate are required.",
        });
        return;
      }

      const booking = await this.bookingService.createBooking({
        patientId,
        roomId,
        admissionDate,
        expectedDischargeDate,
      });
      res.status(201).json({ success: true, data: booking });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  directAdmit = async (req: Request, res: Response): Promise<void> => {
    try {
      const { patient, roomId, admissionDate, expectedDischargeDate } = req.body;
      if (!patient || !roomId || !admissionDate || !expectedDischargeDate) {
        res.status(400).json({
          success: false,
          message: "Patient details, roomId, admissionDate, and expectedDischargeDate are required.",
        });
        return;
      }

      if (!patient.name || !patient.phone || !patient.gender || patient.age === undefined) {
        res.status(400).json({
          success: false,
          message: "Patient name, phone, gender, and age are required.",
        });
        return;
      }

      const result = await this.bookingService.directAdmitPatient({
        patient,
        roomId,
        admissionDate,
        expectedDischargeDate,
      });
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  discharge = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { actualDischargeDate } = req.body;
      const dischargeDate = actualDischargeDate || new Date().toISOString().split("T")[0];

      const result = await this.bookingService.dischargePatient(id, {
        actualDischargeDate: dischargeDate,
      });
      res.status(200).json({ success: true, data: result, message: "Patient discharged successfully." });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  cancel = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.bookingService.cancelBooking(id);
      res.status(200).json({ success: true, data: result, message: "Booking cancelled successfully." });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { admissionDate, expectedDischargeDate } = req.body;
      if (!admissionDate || !expectedDischargeDate) {
        res.status(400).json({ success: false, message: "admissionDate and expectedDischargeDate are required." });
        return;
      }
      const result = await this.bookingService.updateBooking(id, { admissionDate, expectedDischargeDate });
      res.status(200).json({ success: true, data: result, message: "Booking updated successfully." });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };


  getTimeline = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? String(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const end = endDate ? String(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const timeline = await this.bookingService.getTimeline(start, end);
      res.status(200).json({ success: true, data: timeline });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
