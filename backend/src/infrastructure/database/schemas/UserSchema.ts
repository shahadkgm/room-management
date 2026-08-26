import { Schema, model } from "mongoose";
import { IUser } from "../../../core/models/User";

const userMongooseSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "receptionist"], required: true, default: "receptionist" },
    isAllowed: { type: Boolean, default: true },
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

export const UserModel = model<IUser>("User", userMongooseSchema);
