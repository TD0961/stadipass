import mongoose, { Schema, Document, Types } from "mongoose";

export enum OrderStatus {
  PENDING = "pending",
  PAID = "paid",
  CANCELLED = "cancelled",
  REFUNDED = "refunded"
}

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded"
}

export interface IOrderItem {
  ticketCategory: string;  // e.g., "VIP", "Regular"
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IOrder extends Document {
  orderNumber: string;           // Unique order identifier (e.g., ORD-2024-001)
  user: Types.ObjectId;          // ref User
  event: Types.ObjectId;         // ref Event
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentId?: string;            // External payment gateway ID
  paymentMethod?: string;        // e.g., "stripe", "chapa"
  
  // Timestamps
  expiresAt: Date;               // Order expiration time
  paidAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  ticketCategory: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 1, max: 10 },
  unitPrice: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 }
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
  orderNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true,
    match: /^ORD-\d{4}-\d{6}$/  // ORD-2024-000001 format
  },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  items: { type: [OrderItemSchema], required: true, validate: [arrayLimit, 'Order must have at least one item'] },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { 
    type: String, 
    enum: Object.values(OrderStatus), 
    default: OrderStatus.PENDING
  },
  paymentStatus: { 
    type: String, 
    enum: Object.values(PaymentStatus), 
    default: PaymentStatus.PENDING
  },
  paymentId: { type: String, trim: true },
  paymentMethod: { type: String, trim: true },
  expiresAt: { type: Date, required: true },
  paidAt: { type: Date },
  cancelledAt: { type: Date }
}, { 
  timestamps: true,
  toJSON: {
    transform: function(_doc, ret: any) {
      // Add computed fields
      ret.isExpired = new Date() > ret.expiresAt;
      ret.canBeCancelled = ret.status === OrderStatus.PENDING && !ret.isExpired;
      return ret;
    }
  }
});

// Validation function
function arrayLimit(val: any[]) {
  return val && val.length > 0;
}

// Indexes for efficient queries
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ event: 1, status: 1 });
OrderSchema.index({ status: 1, paymentStatus: 1 });
OrderSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for expired orders

// Pre-save middleware to generate order number
OrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Order').countDocuments({
      orderNumber: new RegExp(`^ORD-${year}-`)
    });
    this.orderNumber = `ORD-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Virtual for order summary
OrderSchema.virtual('summary').get(function() {
  const totalTickets = this.items.reduce((sum, item) => sum + item.quantity, 0);
  return {
    totalTickets,
    totalAmount: this.totalAmount,
    status: this.status,
    paymentStatus: this.paymentStatus
  };
});

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
