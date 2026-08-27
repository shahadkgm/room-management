import { Schema, model } from "mongoose";
import { IPatient } from "../../../core/models/Patient";

const patientMongooseSchema = new Schema<IPatient>(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    ailment: { type: String, default: "" },
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

export const PatientModel = model<IPatient>("Patient", patientMongooseSchema);
