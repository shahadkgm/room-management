import { Request, Response } from "express";
import { IRoomService } from "../core/interfaces/services/IRoomService";

export class RoomController {
  constructor(private readonly roomService: IRoomService) {}

  private getId(req: Request): string {
    return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const { ward, floor } = req.query;
      const rooms = await this.roomService.getAllRooms({
        ward: ward ? String(ward) : undefined,
        floor: floor !== undefined ? Number(floor) : undefined,
      });
      res.status(200).json({ success: true, data: rooms });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = this.getId(req);
      const room = await this.roomService.getRoomById(id);
      if (!room) {
        res.status(404).json({ success: false, message: "Room not found." });
        return;
      }
      res.status(200).json({ success: true, data: room });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { roomNumber, ward, floor, bedCount, amenities, isUnderMaintenance } = req.body;
      if (!roomNumber || !ward || floor === undefined || bedCount === undefined) {
        res.status(400).json({
          success: false,
          message: "roomNumber, ward, floor, and bedCount are required.",
        });
        return;
      }

      const room = await this.roomService.createRoom({
        roomNumber,
        ward,
        floor: Number(floor),
        bedCount: Number(bedCount),
        amenities,
        isUnderMaintenance,
      });
      res.status(201).json({ success: true, data: room });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = this.getId(req);
      const updated = await this.roomService.updateRoom(id, req.body);
      if (!updated) {
        res.status(404).json({ success: false, message: "Room not found." });
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
      const deleted = await this.roomService.deleteRoom(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: "Room not found." });
        return;
      }
      res.status(200).json({ success: true, message: "Room deleted successfully." });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  setMaintenance = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = this.getId(req);
      const { isUnderMaintenance } = req.body;
      if (typeof isUnderMaintenance !== "boolean") {
        res.status(400).json({ success: false, message: "isUnderMaintenance must be a boolean." });
        return;
      }

      const room = await this.roomService.setRoomMaintenance(id, isUnderMaintenance);
      res.status(200).json({ success: true, data: room });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
}
