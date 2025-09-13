import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middlewares/auth";
import { ValidationService } from "../services/validationService";
import { User } from "../models/User";
import { Event } from "../models/Event";

const router = Router();

// Validation schemas
const validateByHashSchema = z.object({
  qrCodeHash: z.string().min(1),
  entryLocation: z.string().optional(),
  deviceInfo: z.string().optional()
});

const validateByQRDataSchema = z.object({
  qrData: z.object({
    ticketId: z.string(),
    ticketNumber: z.string(),
    eventId: z.string(),
    userId: z.string(),
    timestamp: z.string(),
    hash: z.string()
  }),
  entryLocation: z.string().optional(),
  deviceInfo: z.string().optional()
});

const validateByNumberSchema = z.object({
  ticketNumber: z.string().min(1),
  entryLocation: z.string().optional(),
  deviceInfo: z.string().optional()
});

// Middleware to check if user can validate tickets
const requireValidator = async (req: any, res: any, next: any) => {
  try {
    const userId = req.auth.sub;
    const user = await User.findById(userId);
    
    if (!user || !['admin', 'staff'].includes(user.role)) {
      return res.status(403).json({ 
        error: "Access denied", 
        message: "Only staff and admin can validate tickets" 
      });
    }
    
    req.validator = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Validate ticket by QR code hash
router.post("/validate/hash", requireAuth, requireValidator, async (req, res) => {
  try {
    const input = validateByHashSchema.parse(req.body);
    const validatorId = (req as any).auth.sub;
    
    const result = await ValidationService.validateTicketByHash(
      input.qrCodeHash,
      validatorId,
      input.entryLocation,
      input.deviceInfo
    );
    
    if (result.valid) {
      return res.json({
        success: true,
        message: result.message,
        ticket: result.details
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error,
        message: result.message,
        ticket: result.ticket || null
      });
    }
    
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: "Invalid input", details: err.issues });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Validate ticket by QR code data
router.post("/validate/qr-data", requireAuth, requireValidator, async (req, res) => {
  try {
    const input = validateByQRDataSchema.parse(req.body);
    const validatorId = (req as any).auth.sub;
    
    const result = await ValidationService.validateTicketByQRData(
      input.qrData,
      validatorId,
      input.entryLocation,
      input.deviceInfo
    );
    
    if (result.valid) {
      return res.json({
        success: true,
        message: result.message,
        ticket: result.details
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error,
        message: result.message,
        ticket: result.ticket || null
      });
    }
    
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: "Invalid input", details: err.issues });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Validate ticket by ticket number (manual entry)
router.post("/validate/number", requireAuth, requireValidator, async (req, res) => {
  try {
    const input = validateByNumberSchema.parse(req.body);
    const validatorId = (req as any).auth.sub;
    
    const result = await ValidationService.validateTicketByNumber(
      input.ticketNumber,
      validatorId,
      input.entryLocation,
      input.deviceInfo
    );
    
    if (result.valid) {
      return res.json({
        success: true,
        message: result.message,
        ticket: result.details
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error,
        message: result.message,
        ticket: result.ticket || null
      });
    }
    
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ error: "Invalid input", details: err.issues });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Check ticket validation status (without validating)
router.get("/check/:ticketId", requireAuth, requireValidator, async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    const result = await ValidationService.checkTicketValidationStatus(ticketId);
    
    return res.json({
      canValidate: result.canValidate,
      reason: result.reason,
      ticket: result.ticket || null
    });
    
  } catch (err: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get validation statistics for an event
router.get("/stats/:eventId", requireAuth, requireValidator, async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    const stats = await ValidationService.getEventValidationStats(eventId);
    
    return res.json({
      event: {
        id: event._id,
        title: event.title,
        startsAt: event.startsAt
      },
      stats
    });
    
  } catch (err: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get validation history for an event
router.get("/history/:eventId", requireAuth, requireValidator, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { limit = "100" } = req.query;
    
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    const limitNum = Math.min(Math.max(parseInt(limit as string, 10) || 100, 1), 1000);
    const history = await ValidationService.getEventValidationHistory(eventId, limitNum);
    
    return res.json({
      event: {
        id: event._id,
        title: event.title,
        startsAt: event.startsAt
      },
      history,
      count: history.length
    });
    
  } catch (err: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get validator info
router.get("/validator-info", requireAuth, requireValidator, async (req, res) => {
  try {
    const validator = (req as any).validator;
    
    return res.json({
      validator: {
        id: validator._id,
        name: `${validator.firstName} ${validator.lastName}`,
        email: validator.email,
        role: validator.role
      }
    });
    
  } catch (err: any) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
