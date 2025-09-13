import { Router } from "express";
import { z } from "zod";
import { Order, OrderStatus, PaymentStatus } from "../models/Order";
import { Ticket, TicketStatus } from "../models/Ticket";
import { Event } from "../models/Event";
import { User } from "../models/User";
import { requireAuth } from "../middlewares/auth";
import { QRCodeService } from "../utils/qrCodeService";
import { InventoryService } from "../services/inventoryService";
import mongoose from "mongoose";

const router = Router();

// Validation schemas
const orderItemSchema = z.object({
  ticketCategory: z.string().min(1).max(60),
  quantity: z.number().int().min(1).max(10)
});

const createOrderSchema = z.object({
  eventId: z.string().min(1),
  items: z.array(orderItemSchema).min(1, "Order must have at least one item")
});

const validateTicketSchema = z.object({
  qrCodeHash: z.string().min(1)
});

// Helper function to check ticket availability
async function checkTicketAvailability(eventId: string, items: Array<{ticketCategory: string, quantity: number}>) {
  const event = await Event.findById(eventId);
  if (!event) {
    throw new Error("Event not found");
  }
  
  if (!event.isPublished) {
    throw new Error("Event is not published");
  }
  
  // Check if event is in the future
  if (event.startsAt < new Date()) {
    throw new Error("Event has already started");
  }
  
  // Check availability for each category
  for (const item of items) {
    const category = event.ticketCategories.find(cat => cat.name === item.ticketCategory);
    if (!category) {
      throw new Error(`Ticket category '${item.ticketCategory}' not found`);
    }
    
    // Count already sold tickets for this category
    const soldTickets = await Ticket.countDocuments({
      event: eventId,
      ticketCategory: item.ticketCategory,
      status: { $in: [TicketStatus.ACTIVE, TicketStatus.USED] }
    });
    
    const available = category.quota - soldTickets;
    if (available < item.quantity) {
      throw new Error(`Only ${available} tickets available for category '${item.ticketCategory}'`);
    }
  }
  
  return event;
}

// Create order (reserve tickets)
router.post("/orders", requireAuth, async (req, res) => {
  try {
    const input = createOrderSchema.parse(req.body);
    const userId = (req as any).auth.sub;
    
    // Check ticket availability
    const event = await checkTicketAvailability(input.eventId, input.items);
    
    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of input.items) {
      const category = event.ticketCategories.find(cat => cat.name === item.ticketCategory);
      if (!category) continue;
      
      const itemTotal = category.price * item.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        ticketCategory: item.ticketCategory,
        quantity: item.quantity,
        unitPrice: category.price,
        totalPrice: itemTotal
      });
    }
    
    // Create order with 15-minute expiration
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);
    
    const order = await Order.create({
      user: userId,
      event: input.eventId,
      items: orderItems,
      totalAmount,
      expiresAt
    });
    
    // Populate the order with event details
    await order.populate('event', 'title startsAt stadium');
    await order.populate('user', 'firstName lastName email');
    
    return res.status(201).json({
      order,
      message: "Order created successfully. Complete payment within 15 minutes to secure your tickets."
    });
    
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: "Invalid input", details: err.issues });
    }
    if (err.message.includes("not found") || err.message.includes("not published")) {
      return res.status(404).json({ error: err.message });
    }
    if (err.message.includes("available") || err.message.includes("started")) {
      return res.status(409).json({ error: err.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get user's orders
router.get("/orders", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth.sub;
    const { page = "1", limit = "20", status } = req.query;
    
    const filter: any = { user: userId };
    if (status) {
      filter.status = status;
    }
    
    const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit as string, 10) || 20, 1), 100);
    
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('event', 'title startsAt stadium')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(filter)
    ]);
    
    return res.json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
    
  } catch (err: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get specific order
router.get("/orders/:orderId", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth.sub;
    const { orderId } = req.params;
    
    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate('event', 'title startsAt stadium')
      .populate('user', 'firstName lastName email')
      .lean();
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    // Get tickets for this order
    const tickets = await Ticket.find({ order: orderId })
      .select('ticketNumber ticketCategory price status qrCode createdAt')
      .lean();
    
    return res.json({
      order,
      tickets
    });
    
  } catch (err: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Cancel order (only if pending and not expired)
router.delete("/orders/:orderId", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth.sub;
    const { orderId } = req.params;
    
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    if (order.status !== OrderStatus.PENDING) {
      return res.status(400).json({ error: "Only pending orders can be cancelled" });
    }
    
    if (new Date() > order.expiresAt) {
      return res.status(400).json({ error: "Order has expired" });
    }
    
    order.status = OrderStatus.CANCELLED;
    order.cancelledAt = new Date();
    await order.save();
    
    return res.json({ message: "Order cancelled successfully" });
    
  } catch (err: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get user's tickets
router.get("/my-tickets", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth.sub;
    const { page = "1", limit = "20", eventId, status } = req.query;
    
    const filter: any = { user: userId };
    if (eventId) filter.event = eventId;
    if (status) filter.status = status;
    
    const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit as string, 10) || 20, 1), 100);
    
    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .populate('event', 'title startsAt stadium')
        .populate('order', 'orderNumber status')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Ticket.countDocuments(filter)
    ]);
    
    return res.json({
      tickets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
    
  } catch (err: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get specific ticket
router.get("/tickets/:ticketId", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth.sub;
    const { ticketId } = req.params;
    
    const ticket = await Ticket.findOne({ _id: ticketId, user: userId })
      .populate('event', 'title startsAt stadium')
      .populate('order', 'orderNumber status')
      .lean();
    
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    
    return res.json({ ticket });
    
  } catch (err: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Validate ticket (for entry scanning)
router.post("/validate", requireAuth, async (req, res) => {
  try {
    const input = validateTicketSchema.parse(req.body);
    const validatorId = (req as any).auth.sub;
    
    // Check if user has staff or admin role
    const validator = await User.findById(validatorId);
    if (!validator || !['admin', 'staff'].includes(validator.role)) {
      return res.status(403).json({ error: "Only staff and admin can validate tickets" });
    }
    
    const ticket = await Ticket.findOne({ qrCodeHash: input.qrCodeHash }).populate('event user');
    if (!ticket) {
      return res.status(400).json({ 
        error: 'Ticket not found',
        ticket: null
      });
    }
    
    if (ticket.status !== TicketStatus.ACTIVE) {
      return res.status(400).json({ 
        error: 'Ticket is not active',
        ticket: ticket
      });
    }
    
    // Check if event is still valid (not in the past)
    const now = new Date();
    const event = ticket.event as any;
    if (event.startsAt < now) {
      return res.status(400).json({ 
        error: 'Event has already started',
        ticket: ticket
      });
    }
    
    // Mark ticket as used
    ticket.status = TicketStatus.USED;
    ticket.usedAt = new Date();
    ticket.usedBy = validatorId;
    ticket.entryLocation = req.get('user-agent') || 'Unknown device';
    ticket.deviceInfo = req.ip || 'Unknown location';
    await ticket.save();
    
    return res.json({
      valid: true,
      message: "Ticket validated successfully",
      ticket: {
        ticketNumber: ticket.ticketNumber,
        event: ticket.event,
        user: ticket.user,
        category: ticket.ticketCategory,
        price: ticket.price,
        usedAt: ticket.usedAt
      }
    });
    
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: "Invalid input", details: err.issues });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get event ticket availability
router.get("/events/:eventId/availability", requireAuth, async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
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
    
    return res.json({
      event: {
        id: event._id,
        title: event.title,
        startsAt: event.startsAt,
        isPublished: event.isPublished
      },
      availability
    });
    
  } catch (err: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get ticket QR code as data URL
router.get("/tickets/:ticketId/qr-code", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth.sub;
    const { ticketId } = req.params;
    const { format = "dataurl" } = req.query;
    
    const ticket = await Ticket.findOne({ _id: ticketId, user: userId })
      .populate('event', 'title startsAt stadium')
      .populate('user', 'firstName lastName email');
    
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    
    if (format === "svg") {
      const qrCodeSVG = await QRCodeService.generateQRCodeSVG(ticket);
      res.setHeader('Content-Type', 'image/svg+xml');
      return res.send(qrCodeSVG);
    } else if (format === "buffer") {
      const qrCodeBuffer = await QRCodeService.generateQRCodeBuffer(ticket);
      res.setHeader('Content-Type', 'image/png');
      return res.send(qrCodeBuffer);
    } else {
      const qrCodeDataURL = await QRCodeService.generateQRCodeDataURL(ticket);
      return res.json({ qrCode: qrCodeDataURL });
    }
    
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to generate QR code" });
  }
});

// Get ticket with QR code for display
router.get("/tickets/:ticketId/display", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth.sub;
    const { ticketId } = req.params;
    
    const ticketWithQR = await QRCodeService.generateTicketWithQRCode(ticketId);
    
    // Check if user owns this ticket
    if (ticketWithQR.ticket.user._id.toString() !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    return res.json(ticketWithQR);
    
  } catch (err: any) {
    if (err.message === "Ticket not found") {
      return res.status(404).json({ error: "Ticket not found" });
    }
    return res.status(500).json({ error: "Failed to generate ticket display" });
  }
});

// Get order QR codes
router.get("/orders/:orderId/qr-codes", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth.sub;
    const { orderId } = req.params;
    
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    const orderQRCodes = await QRCodeService.generateOrderQRCodes(orderId);
    
    return res.json({
      orderId,
      tickets: orderQRCodes
    });
    
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to generate order QR codes" });
  }
});

// Generate validation QR code (for staff/admin)
router.get("/tickets/:ticketId/validation-qr", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth.sub;
    const { ticketId } = req.params;
    
    // Check if user has staff or admin role
    const user = await User.findById(userId);
    if (!user || !['admin', 'staff'].includes(user.role)) {
      return res.status(403).json({ error: "Only staff and admin can access validation QR codes" });
    }
    
    const ticket = await Ticket.findById(ticketId)
      .populate('event', 'title startsAt')
      .populate('user', 'firstName lastName email');
    
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    
    const validationQRCode = await QRCodeService.generateValidationQRCode(ticket);
    
    return res.json({
      ticket: {
        ticketNumber: ticket.ticketNumber,
        event: ticket.event,
        user: ticket.user,
        status: ticket.status
      },
      validationQRCode
    });
    
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to generate validation QR code" });
  }
});

// Get comprehensive inventory for an event
router.get("/inventory/:eventId", requireAuth, async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const inventory = await InventoryService.getEventInventory(eventId);
    
    return res.json(inventory);
    
  } catch (err: any) {
    if (err.message === "Event not found") {
      return res.status(404).json({ error: "Event not found" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get inventory for multiple events
router.post("/inventory/multiple", requireAuth, async (req, res) => {
  try {
    const { eventIds } = req.body;
    
    if (!Array.isArray(eventIds)) {
      return res.status(400).json({ error: "eventIds must be an array" });
    }
    
    const inventories = await InventoryService.getMultipleEventsInventory(eventIds);
    
    return res.json({ inventories });
    
  } catch (err: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get all published events inventory
router.get("/inventory/published", requireAuth, async (req, res) => {
  try {
    const inventories = await InventoryService.getAllPublishedEventsInventory();
    
    return res.json({ inventories });
    
  } catch (err: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Check ticket availability
router.get("/availability/:eventId/:category", requireAuth, async (req, res) => {
  try {
    const { eventId, category } = req.params;
    const { quantity = "1" } = req.query;
    
    const quantityNum = parseInt(quantity as string, 10) || 1;
    
    const availability = await InventoryService.checkAvailability(eventId, category, quantityNum);
    
    return res.json(availability);
    
  } catch (err: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get inventory statistics (admin only)
router.get("/inventory/stats", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth.sub;
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const stats = await InventoryService.getInventoryStats();
    
    return res.json(stats);
    
  } catch (err: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get low stock alerts (admin only)
router.get("/inventory/alerts", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth.sub;
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const { threshold = "10" } = req.query;
    const thresholdNum = parseInt(threshold as string, 10) || 10;
    
    const alerts = await InventoryService.getLowStockAlerts(thresholdNum);
    
    return res.json({ alerts });
    
  } catch (err: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get sales trends for an event (admin only)
router.get("/inventory/trends/:eventId", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth.sub;
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const { eventId } = req.params;
    const { days = "30" } = req.query;
    const daysNum = parseInt(days as string, 10) || 30;
    
    const trends = await InventoryService.getEventSalesTrend(eventId, daysNum);
    
    return res.json({ trends });
    
  } catch (err: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Update event categories (admin only)
router.put("/inventory/categories/:eventId", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth.sub;
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const { eventId } = req.params;
    const { categories } = req.body;
    
    if (!Array.isArray(categories)) {
      return res.status(400).json({ error: "Categories must be an array" });
    }
    
    const result = await InventoryService.updateEventCategories(eventId, categories);
    
    if (result.success) {
      return res.json({ message: result.message });
    } else {
      return res.status(400).json({ error: result.message });
    }
    
  } catch (err: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
