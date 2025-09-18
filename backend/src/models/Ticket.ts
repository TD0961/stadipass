import mongoose, { Schema, Document, Types } from "mongoose";

export enum TicketStatus {
  ACTIVE = "active",
  USED = "used",
  CANCELLED = "cancelled",
  REFUNDED = "refunded"
}

export interface ITicket extends Document {
  ticketNumber: string;          // Unique ticket identifier (e.g., TKT-2024-001)
  order: Types.ObjectId;         // ref Order
  user: Types.ObjectId;          // ref User (ticket holder)
  event: Types.ObjectId;         // ref Event
  ticketCategory: string;        // e.g., "VIP", "Regular"
  price: number;                 // Price paid for this ticket
  status: TicketStatus;
  
  // QR Code and validation
  qrCode: string;                // Unique QR code data
  qrCodeHash: string;            // Hashed version for validation
  
  // Entry tracking
  usedAt?: Date;                 // When ticket was scanned/used
  usedBy?: Types.ObjectId;       // ref User (staff who validated)
  entryLocation?: string;        // Gate/entrance where ticket was used
  deviceInfo?: string;           // Device used for validation
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>({
  ticketNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true,
    match: /^TKT-\d{4}-\d{8}$/  // TKT-2024-00000001 format
  },
  order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  ticketCategory: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    enum: Object.values(TicketStatus), 
    default: TicketStatus.ACTIVE
  },
  qrCode: { type: String, required: true, unique: true },
  qrCodeHash: { type: String, required: true, unique: true },
  usedAt: { type: Date },
  usedBy: { type: Schema.Types.ObjectId, ref: "User" },
  entryLocation: { type: String, trim: true },
  deviceInfo: { type: String, trim: true }
}, { 
  timestamps: true,
  toJSON: {
    transform: function(_doc, ret: any) {
      // Add computed fields
      ret.isUsed = ret.status === TicketStatus.USED;
      ret.isValid = ret.status === TicketStatus.ACTIVE;
      ret.canBeUsed = ret.status === TicketStatus.ACTIVE;
      return ret;
    }
  }
});

// Indexes for efficient queries
TicketSchema.index({ order: 1 });
TicketSchema.index({ user: 1, event: 1 });
TicketSchema.index({ event: 1, status: 1 });
TicketSchema.index({ status: 1, event: 1 });

// Pre-save middleware to generate ticket number and QR code
TicketSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generate ticket number
    if (!this.ticketNumber) {
      const year = new Date().getFullYear();
      const count = await mongoose.model('Ticket').countDocuments({
        ticketNumber: new RegExp(`^TKT-${year}-`)
      });
      this.ticketNumber = `TKT-${year}-${String(count + 1).padStart(8, '0')}`;
    }
    
    // Generate QR code data
    if (!this.qrCode) {
      const crypto = await import('crypto');
      const qrData = {
        ticketId: (this._id as Types.ObjectId).toString(),
        ticketNumber: this.ticketNumber,
        eventId: this.event.toString(),
        userId: this.user.toString(),
        timestamp: new Date().toISOString()
      };
      this.qrCode = JSON.stringify(qrData);
      this.qrCodeHash = crypto.createHash('sha256').update(this.qrCode).digest('hex');
    }
  }
  next();
});

// Virtual for ticket summary
TicketSchema.virtual('summary').get(function() {
  return {
    ticketNumber: this.ticketNumber,
    status: this.status,
    price: this.price,
    category: this.ticketCategory,
    isUsed: this.status === TicketStatus.USED,
    isValid: this.status === TicketStatus.ACTIVE
  };
});

// Static method to validate QR code
TicketSchema.statics.validateQRCode = async function(qrCodeHash: string) {
  const ticket = await this.findOne({ qrCodeHash }).populate('event user');
  if (!ticket) {
    return { valid: false, error: 'Ticket not found' };
  }
  
  if (ticket.status !== TicketStatus.ACTIVE) {
    return { valid: false, error: 'Ticket is not active', ticket };
  }
  
  // Check if event is still valid (not in the past)
  const now = new Date();
  if (ticket.event.startsAt < now) {
    return { valid: false, error: 'Event has already started', ticket };
  }
  
  return { valid: true, ticket };
};

// Instance method to mark ticket as used
TicketSchema.methods.markAsUsed = function(usedBy: string, entryLocation?: string, deviceInfo?: string) {
  if (this.status !== TicketStatus.ACTIVE) {
    throw new Error('Only active tickets can be marked as used');
  }
  
  this.status = TicketStatus.USED;
  this.usedAt = new Date();
  this.usedBy = usedBy;
  this.entryLocation = entryLocation;
  this.deviceInfo = deviceInfo;
  
  return this.save();
};

export const Ticket = mongoose.model<ITicket>("Ticket", TicketSchema);
