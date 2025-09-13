import { Ticket, TicketStatus } from '../models/Ticket';
import { Order, OrderStatus } from '../models/Order';
import { Event } from '../models/Event';
import { Stadium } from '../models/Stadium';
import mongoose from 'mongoose';

export interface InventoryItem {
  category: string;
  price: number;
  totalQuota: number;
  sold: number;
  available: number;
  reserved: number;
  soldOut: boolean;
  salesPercentage: number;
}

export interface EventInventory {
  event: {
    id: string;
    title: string;
    startsAt: Date;
    stadium: string;
    isPublished: boolean;
  };
  categories: InventoryItem[];
  summary: {
    totalQuota: number;
    totalSold: number;
    totalAvailable: number;
    totalReserved: number;
    overallSalesPercentage: number;
    revenue: number;
  };
}

export interface InventoryStats {
  totalEvents: number;
  activeEvents: number;
  totalTickets: number;
  soldTickets: number;
  availableTickets: number;
  totalRevenue: number;
  averageTicketPrice: number;
}

/**
 * Service for managing ticket inventory and availability
 */
export class InventoryService {
  
  /**
   * Get inventory for a specific event
   */
  static async getEventInventory(eventId: string): Promise<EventInventory> {
    const event = await Event.findById(eventId)
      .populate('stadium', 'name location');
    
    if (!event) {
      throw new Error('Event not found');
    }
    
    const categories = [];
    let totalQuota = 0;
    let totalSold = 0;
    let totalReserved = 0;
    let totalRevenue = 0;
    
    for (const category of event.ticketCategories) {
      const [soldTickets, reservedTickets] = await Promise.all([
        Ticket.countDocuments({
          event: eventId,
          ticketCategory: category.name,
          status: { $in: [TicketStatus.ACTIVE, TicketStatus.USED] }
        }),
        Order.countDocuments({
          event: eventId,
          status: OrderStatus.PENDING,
          'items.ticketCategory': category.name
        })
      ]);
      
      const available = category.quota - soldTickets;
      const salesPercentage = category.quota > 0 ? (soldTickets / category.quota) * 100 : 0;
      
      categories.push({
        category: category.name,
        price: category.price,
        totalQuota: category.quota,
        sold: soldTickets,
        available,
        reserved: reservedTickets,
        soldOut: soldTickets >= category.quota,
        salesPercentage
      });
      
      totalQuota += category.quota;
      totalSold += soldTickets;
      totalReserved += reservedTickets;
      totalRevenue += soldTickets * category.price;
    }
    
    const overallSalesPercentage = totalQuota > 0 ? (totalSold / totalQuota) * 100 : 0;
    
    return {
      event: {
        id: (event._id as mongoose.Types.ObjectId).toString(),
        title: event.title,
        startsAt: event.startsAt,
        stadium: (event.stadium as any).name,
        isPublished: event.isPublished
      },
      categories,
      summary: {
        totalQuota,
        totalSold,
        totalAvailable: totalQuota - totalSold,
        totalReserved,
        overallSalesPercentage,
        revenue: totalRevenue
      }
    };
  }
  
  /**
   * Get inventory for multiple events
   */
  static async getMultipleEventsInventory(eventIds: string[]): Promise<EventInventory[]> {
    const inventories = [];
    
    for (const eventId of eventIds) {
      try {
        const inventory = await this.getEventInventory(eventId);
        inventories.push(inventory);
      } catch (error) {
        console.error(`Failed to get inventory for event ${eventId}:`, error);
      }
    }
    
    return inventories;
  }
  
  /**
   * Get inventory for all published events
   */
  static async getAllPublishedEventsInventory(): Promise<EventInventory[]> {
    const events = await Event.find({ isPublished: true })
      .select('_id')
      .lean();
    
    const eventIds = events.map(event => event._id.toString());
    return await this.getMultipleEventsInventory(eventIds);
  }
  
  /**
   * Check if tickets are available for a specific category
   */
  static async checkAvailability(
    eventId: string, 
    category: string, 
    quantity: number = 1
  ): Promise<{ available: boolean; remaining: number; message: string }> {
    const event = await Event.findById(eventId);
    if (!event) {
      return { available: false, remaining: 0, message: 'Event not found' };
    }
    
    const ticketCategory = event.ticketCategories.find(cat => cat.name === category);
    if (!ticketCategory) {
      return { available: false, remaining: 0, message: 'Ticket category not found' };
    }
    
    const soldTickets = await Ticket.countDocuments({
      event: eventId,
      ticketCategory: category,
      status: { $in: [TicketStatus.ACTIVE, TicketStatus.USED] }
    });
    
    const remaining = ticketCategory.quota - soldTickets;
    const available = remaining >= quantity;
    
    let message = '';
    if (available) {
      message = `${quantity} ticket(s) available`;
    } else if (remaining > 0) {
      message = `Only ${remaining} ticket(s) remaining`;
    } else {
      message = 'Sold out';
    }
    
    return { available, remaining, message };
  }
  
  /**
   * Reserve tickets (create pending order)
   */
  static async reserveTickets(
    eventId: string,
    userId: string,
    items: Array<{ category: string; quantity: number }>
  ): Promise<{ success: boolean; orderId?: string; message: string }> {
    const session = await mongoose.startSession();
    
    try {
      let result = { success: false, message: '' };
      
      await session.withTransaction(async () => {
        // Check availability for all items
        for (const item of items) {
          const availability = await this.checkAvailability(eventId, item.category, item.quantity);
          if (!availability.available) {
            result.message = availability.message;
            throw new Error(availability.message);
          }
        }
        
        // Create order (this will be handled by the order creation endpoint)
        result.success = true;
        result.message = 'Tickets reserved successfully';
      });
      
      return result;
      
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to reserve tickets'
      };
    } finally {
      await session.endSession();
    }
  }
  
  /**
   * Get inventory statistics
   */
  static async getInventoryStats(): Promise<InventoryStats> {
    const [
      totalEvents,
      activeEvents,
      totalTickets,
      soldTickets,
      revenueData
    ] = await Promise.all([
      Event.countDocuments(),
      Event.countDocuments({ isPublished: true }),
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: { $in: [TicketStatus.ACTIVE, TicketStatus.USED] } }),
      Ticket.aggregate([
        { $match: { status: { $in: [TicketStatus.ACTIVE, TicketStatus.USED] } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$price' },
            averagePrice: { $avg: '$price' }
          }
        }
      ])
    ]);
    
    const availableTickets = totalTickets - soldTickets;
    const totalRevenue = revenueData[0]?.totalRevenue || 0;
    const averageTicketPrice = revenueData[0]?.averagePrice || 0;
    
    return {
      totalEvents,
      activeEvents,
      totalTickets,
      soldTickets,
      availableTickets,
      totalRevenue,
      averageTicketPrice
    };
  }
  
  /**
   * Get low stock alerts
   */
  static async getLowStockAlerts(threshold: number = 10): Promise<Array<{
    event: any;
    category: string;
    remaining: number;
    percentage: number;
  }>> {
    const events = await Event.find({ isPublished: true })
      .populate('stadium', 'name')
      .lean();
    
    const alerts = [];
    
    for (const event of events) {
      for (const category of event.ticketCategories) {
        const soldTickets = await Ticket.countDocuments({
          event: event._id,
          ticketCategory: category.name,
          status: { $in: [TicketStatus.ACTIVE, TicketStatus.USED] }
        });
        
        const remaining = category.quota - soldTickets;
        const percentage = category.quota > 0 ? (remaining / category.quota) * 100 : 0;
        
        if (remaining <= threshold && remaining > 0) {
          alerts.push({
            event: {
              id: event._id,
              title: event.title,
              startsAt: event.startsAt,
              stadium: (event.stadium as any).name
            },
            category: category.name,
            remaining,
            percentage
          });
        }
      }
    }
    
    return alerts.sort((a, b) => a.remaining - b.remaining);
  }
  
  /**
   * Get sales trends for an event
   */
  static async getEventSalesTrend(eventId: string, days: number = 30): Promise<Array<{
    date: string;
    ticketsSold: number;
    revenue: number;
  }>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const sales = await Ticket.aggregate([
      {
        $match: {
          event: new mongoose.Types.ObjectId(eventId),
          status: { $in: [TicketStatus.ACTIVE, TicketStatus.USED] },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          ticketsSold: { $sum: 1 },
          revenue: { $sum: '$price' }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);
    
    return sales.map(sale => ({
      date: sale._id.date,
      ticketsSold: sale.ticketsSold,
      revenue: sale.revenue
    }));
  }
  
  /**
   * Update event ticket categories (admin only)
   */
  static async updateEventCategories(
    eventId: string,
    categories: Array<{ name: string; price: number; quota: number }>
  ): Promise<{ success: boolean; message: string }> {
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        const event = await Event.findById(eventId).session(session);
        if (!event) {
          throw new Error('Event not found');
        }
        
        // Check if any tickets have been sold
        const soldTickets = await Ticket.countDocuments({
          event: eventId,
          status: { $in: [TicketStatus.ACTIVE, TicketStatus.USED] }
        }).session(session);
        
        if (soldTickets > 0) {
          throw new Error('Cannot modify categories after tickets have been sold');
        }
        
        // Update categories
        event.ticketCategories = categories;
        await event.save({ session });
      });
      
      return { success: true, message: 'Event categories updated successfully' };
      
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update categories'
      };
    } finally {
      await session.endSession();
    }
  }
}
