import { Request, Response } from "express";
import { IPatientService } from "../core/interfaces/services/IPatientService";

export class PatientController {
  constructor(private readonly patientService: IPatientService) {}

  private getId(req: Request): string {
    return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const { search } = req.query;
      const patients = await this.patientService.getAllPatients({
        search: search ? String(search) : undefined,
      });
      res.status(200).json({ success: true, data: patients });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = this.getId(req);
      const patient = await this.patientService.getPatientById(id);
      if (!patient) {
        res.status(404).json({ success: false, message: "Patient not found." });
        return;
      }
      res.status(200).json({ success: true, data: patient });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, age, gender, phone, address, ailment } = req.body;
      if (!name || age === undefined || !gender || !phone || !address || !ailment) {
        res.status(400).json({
          success: false,
          message: "Name, age, gender, phone, address, and ailment are required.",
        });
        return;
      }

      const patient = await this.patientService.createPatient({
        name,
        age: Number(age),
        gender,
        phone,
        address,
        ailment,
      });
      res.status(201).json({ success: true, data: patient });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = this.getId(req);
      const updated = await this.patientService.updatePatient(id, req.body);
      if (!updated) {
        res.status(404).json({ success: false, message: "Patient not found." });
        return;
      }
      res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = this.getId(req);
      const deleted = await this.patientService.deletePatient(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: "Patient not found." });
        return;
      }
      res.status(200).json({ success: true, message: "Patient deleted successfully." });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
}
