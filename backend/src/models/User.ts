import mongoose, { Schema, Document } from "mongoose";

export enum UserRole {
  CUSTOMER = "customer",
  ADMIN = "admin",
  STAFF = "staff"
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  emailVerifiedAt?: Date;
  lastLoginAt?: Date;
  oauthProvider?: string;
  oauthProviderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true,
      lowercase: true,
      trim: true
    },
    passwordHash: { type: String, required: function() { return !this.oauthProvider; } },
    firstName: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 50
    },
    lastName: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 50
    },
    phone: { 
      type: String, 
      trim: true,
      match: /^[\+]?[1-9][\d]{0,15}$/ // Basic phone validation
    },
    role: { 
      type: String, 
      enum: Object.values(UserRole), 
      default: UserRole.CUSTOMER 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    emailVerifiedAt: { type: Date },
    lastLoginAt: { type: Date },
    oauthProvider: { type: String, enum: ['google', 'github'] },
    oauthProviderId: { type: String }
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(_doc, ret) {
        const { passwordHash: _omitted, ...safe } = ret as any;
        return safe;
      }
    }
  }
);

// Index for efficient queries (field-level indexes already defined where needed)
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });

export const User = mongoose.model<IUser>("User", UserSchema);
