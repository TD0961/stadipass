import mongoose, { Schema, Document } from "mongoose";

export interface IStadiumSection {
  name: string;
  capacity: number;
}

export interface IStadium extends Document {
  name: string;
  location?: string;
  capacity: number;
  sections: IStadiumSection[];
  createdAt: Date;
  updatedAt: Date;
}

const StadiumSectionSchema = new Schema<IStadiumSection>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    capacity: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const StadiumSchema = new Schema<IStadium>(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 120 },
    location: { type: String, trim: true, maxlength: 200 },
    capacity: { type: Number, required: true, min: 0 },
    sections: { type: [StadiumSectionSchema], default: [] }
  },
  { timestamps: true }
);

StadiumSchema.index({ name: 1 }, { unique: true });

export const Stadium = mongoose.model<IStadium>("Stadium", StadiumSchema);


