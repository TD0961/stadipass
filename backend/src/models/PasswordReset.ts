import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPasswordReset extends Document {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PasswordResetSchema = new Schema<IPasswordReset>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  tokenHash: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  usedAt: { type: Date },
  ip: { type: String, maxlength: 45 },
  userAgent: { type: String, maxlength: 500 }
}, { timestamps: true });

PasswordResetSchema.index({ userId: 1, usedAt: 1 });
PasswordResetSchema.index({ tokenHash: 1, expiresAt: 1 });

export const PasswordReset = mongoose.model<IPasswordReset>("PasswordReset", PasswordResetSchema);
