import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITicketCategory {
  name: string;           // e.g., VIP, Regular
  price: number;          // price per ticket
  quota: number;          // how many tickets of this category
}

export interface IEvent extends Document {
  stadium: Types.ObjectId;  // ref Stadium
  title: string;            // e.g., Team A vs Team B
  startsAt: Date;           // kickoff or event start time
  endsAt?: Date;            // optional end time
  ticketCategories: ITicketCategory[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TicketCategorySchema = new Schema<ITicketCategory>({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  price: { type: Number, required: true, min: 0 },
  quota: { type: Number, required: true, min: 0 }
}, { _id: false });

const EventSchema = new Schema<IEvent>({
  stadium: { type: Schema.Types.ObjectId, ref: "Stadium", required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 140 },
  startsAt: { type: Date, required: true },
  endsAt: { type: Date },
  ticketCategories: { type: [TicketCategorySchema], default: [] },
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

EventSchema.index({ stadium: 1, startsAt: 1 });

export const Event = mongoose.model<IEvent>("Event", EventSchema);
