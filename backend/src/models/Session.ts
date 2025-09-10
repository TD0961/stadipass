import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISession extends Document {
  userId: Types.ObjectId;
  refreshTokenHash: string;
  userAgent?: string;
  ip?: string;
  revokedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  refreshTokenHash: { type: String, required: true, index: true },
  userAgent: { type: String, maxlength: 500 },
  ip: { type: String, maxlength: 45 },
  revokedAt: { type: Date },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }
}, { timestamps: true });

SessionSchema.index({ userId: 1, revokedAt: 1 });

export const Session = mongoose.model<ISession>("Session", SessionSchema);
