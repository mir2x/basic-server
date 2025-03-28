import { calculateAge } from "@utils/calculateAge";
import { Schema, model, Types, Document } from "mongoose";

export type DecodedUser = {
  authId: string;
  userId: string;
  userName: string;
  email: string;
  isVerified: boolean;
};

export type UserSchema = Document & {
  auth: Types.ObjectId;
  name: string;
  userName: string;
  mobileNumber: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  avatar: string;
};

const userSchema = new Schema(
  {
    auth: { type: Schema.Types.ObjectId, ref: "Auth", required: true },
    name: { type: String, required: true },
    userName: { type: String },
    mobileNumber: { type: Number, required: true },
    dateOfBirth: { type: String },
    age: { type: Number },
    gender: { type: String },
    avatar: { type: String },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function (next) {
  if (this.isModified("dateOfBirth") && this.dateOfBirth) {
    this.age = calculateAge(this.dateOfBirth);
  }
  next();
});

userSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as Partial<UserSchema>;
  if (update.dateOfBirth) {
    update.age = calculateAge(update.dateOfBirth);
    this.setUpdate(update);
  }
  next();
});

userSchema.pre("findOneAndDelete", async function (next) {
  const user = await this.findOne(this.getQuery());
  if (!user) return next();
});

export const User = model<UserSchema>("User", userSchema);
export default User;
