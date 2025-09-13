import { Order, OrderStatus, PaymentStatus, IOrder } from "../models/Order";
import { Ticket, TicketStatus, ITicket } from "../models/Ticket";
import { Event } from "../models/Event";
import mongoose, { Types } from "mongoose";

/**
 * Service for handling ticket operations
 */
export class TicketService {
  
  /**
   * Generate tickets for a paid order
   */
  static async generateTicketsForOrder(orderId: string): Promise<ITicket[]> {
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Get the order
        const order = await Order.findById(orderId).session(session);
        if (!order) {
          throw new Error("Order not found");
        }
        
        if (order.status !== OrderStatus.PENDING) {
          throw new Error("Order is not pending");
        }
        
        if (order.paymentStatus !== PaymentStatus.COMPLETED) {
          throw new Error("Order payment is not completed");
        }
        
        // Get event details
        const event = await Event.findById(order.event).session(session);
        if (!event) {
          throw new Error("Event not found");
        }
        
        // Generate tickets for each order item
        const tickets = [];
        for (const item of order.items) {
          for (let i = 0; i < item.quantity; i++) {
            const ticket = new Ticket({
              order: order._id,
              user: order.user,
              event: order.event,
              ticketCategory: item.ticketCategory,
              price: item.unitPrice
            });
            
            await ticket.save({ session });
            tickets.push(ticket);
          }
        }
        
        // Update order status
        order.status = OrderStatus.PAID;
        order.paidAt = new Date();
        await order.save({ session });
        
        return tickets;
      });
      
      // Return tickets outside transaction
      return await Ticket.find({ order: orderId }).populate('event', 'title startsAt');
      
    } catch (error) {
      console.error("Failed to generate tickets:", error);
      throw error;
    } finally {
      await session.endSession();
    }
  }
  
  /**
   * Cancel tickets for a cancelled order
   */
  static async cancelTicketsForOrder(orderId: string): Promise<void> {
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Get the order
        const order = await Order.findById(orderId).session(session);
        if (!order) {
          throw new Error("Order not found");
        }
        
        // Cancel all tickets for this order
        await Ticket.updateMany(
          { order: orderId, status: TicketStatus.ACTIVE },
          { 
            $set: { 
              status: TicketStatus.CANCELLED,
              updatedAt: new Date()
            }
          },
          { session }
        );
        
        // Update order status
        order.status = OrderStatus.CANCELLED;
        order.cancelledAt = new Date();
        await order.save({ session });
      });
      
    } catch (error) {
      console.error("Failed to cancel tickets:", error);
      throw error;
    } finally {
      await session.endSession();
    }
  }
  
  /**
   * Get ticket availability for an event
   */
  static async getEventAvailability(eventId: string): Promise<any[]> {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error("Event not found");
    }
    
    const availability = [];
    
    for (const category of event.ticketCategories) {
      const soldTickets = await Ticket.countDocuments({
        event: eventId,
        ticketCategory: category.name,
        status: { $in: [TicketStatus.ACTIVE, TicketStatus.USED] }
      });
      
      availability.push({
        category: category.name,
        price: category.price,
        totalQuota: category.quota,
        sold: soldTickets,
        available: category.quota - soldTickets,
        soldOut: soldTickets >= category.quota
      });
    }
    
    return availability;
  }
  
  /**
   * Validate ticket QR code
   */
  static async validateTicket(qrCodeHash: string): Promise<{valid: boolean, ticket?: any, error?: string}> {
    const ticket = await Ticket.findOne({ qrCodeHash }).populate('event user');
    
    if (!ticket) {
      return { valid: false, error: 'Ticket not found' };
    }
    
    if (ticket.status !== TicketStatus.ACTIVE) {
      return { valid: false, error: 'Ticket is not active', ticket };
    }
    
    // Check if event is still valid (not in the past)
    const now = new Date();
    const event = ticket.event as any;
    if (event.startsAt < now) {
      return { valid: false, error: 'Event has already started', ticket };
    }
    
    return { valid: true, ticket };
  }
  
  /**
   * Mark ticket as used
   */
  static async markTicketAsUsed(
    ticketId: string, 
    usedBy: string, 
    entryLocation?: string, 
    deviceInfo?: string
  ): Promise<ITicket> {
    const ticket = await Ticket.findById(ticketId);
    
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    
    if (ticket.status !== TicketStatus.ACTIVE) {
      throw new Error("Only active tickets can be marked as used");
    }
    
    ticket.status = TicketStatus.USED;
    ticket.usedAt = new Date();
    ticket.usedBy = new Types.ObjectId(usedBy);
    ticket.entryLocation = entryLocation;
    ticket.deviceInfo = deviceInfo;
    
    return await ticket.save();
  }
  
  /**
   * Get ticket statistics for an event
   */
  static async getEventTicketStats(eventId: string): Promise<any> {
    const [totalTickets, usedTickets, activeTickets, cancelledTickets] = await Promise.all([
      Ticket.countDocuments({ event: eventId }),
      Ticket.countDocuments({ event: eventId, status: TicketStatus.USED }),
      Ticket.countDocuments({ event: eventId, status: TicketStatus.ACTIVE }),
      Ticket.countDocuments({ event: eventId, status: TicketStatus.CANCELLED })
    ]);
    
    const revenue = await Ticket.aggregate([
      { $match: { event: new mongoose.Types.ObjectId(eventId), status: { $in: [TicketStatus.ACTIVE, TicketStatus.USED] } } },
      { $group: { _id: null, totalRevenue: { $sum: "$price" } } }
    ]);
    
    return {
      totalTickets,
      usedTickets,
      activeTickets,
      cancelledTickets,
      totalRevenue: revenue[0]?.totalRevenue || 0
    };
  }
  
  /**
   * Clean up expired orders and their tickets
   */
  static async cleanupExpiredOrders(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - 24); // 24 hours ago
    
    const expiredOrders = await Order.find({
      status: OrderStatus.PENDING,
      expiresAt: { $lt: cutoffDate }
    });
    
    let cleanedCount = 0;
    
    for (const order of expiredOrders) {
      await this.cancelTicketsForOrder((order._id as Types.ObjectId).toString());
      cleanedCount++;
    }
    
    return cleanedCount;
  }
}
