import { Schema, model } from "mongoose";
import { IRoom } from "../../../core/models/Room";

const roomMongooseSchema = new Schema<IRoom>(
  {
    roomNumber: { type: String, required: true, unique: true },
    ward: { type: String, required: true },
    floor: { type: Number, required: true, default: 1 },
    bedCount: { type: Number, required: true, default: 1 },
    dailyRate: { type: Number, required: true, default: 1000 },
    amenities: { type: [String], default: [] },
    isUnderMaintenance: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const RoomModel = model<IRoom>("Room", roomMongooseSchema);
