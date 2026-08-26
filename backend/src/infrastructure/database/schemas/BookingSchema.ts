import { Schema, model } from "mongoose";
import { IBooking } from "../../../core/models/Booking";

const bookingMongooseSchema = new Schema<IBooking>(
  {
    patientId: { type: String, required: true, ref: "Patient" },
    roomId: { type: String, required: true, ref: "Room" },
    admissionDate: { type: String, required: true },
    expectedDischargeDate: { type: String, required: true },
    actualDischargeDate: { type: String },
    status: {
      type: String,
      enum: ["active", "reserved", "completed", "cancelled"],
      required: true,
      default: "active",
    },
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

export const BookingModel = model<IBooking>("Booking", bookingMongooseSchema);
