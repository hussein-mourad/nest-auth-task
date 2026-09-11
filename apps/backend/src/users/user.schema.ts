import { HydratedDocument, Schema } from 'mongoose';

export interface User {
  email: string;
  name: string;
  passwordHash: string;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = new Schema<User>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);
