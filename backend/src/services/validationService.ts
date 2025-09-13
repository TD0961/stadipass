import { Ticket, TicketStatus } from '../models/Ticket';
import { Event } from '../models/Event';
import { User } from '../models/User';
import { QRCodeService } from '../utils/qrCodeService';
import mongoose from 'mongoose';

export interface ValidationResult {
  valid: boolean;
  ticket?: any;
  error?: string;
  message?: string;
  details?: {
    ticketNumber: string;
    eventTitle: string;
    userName: string;
    category: string;
    price: number;
    usedAt?: Date;
    entryLocation?: string;
  };
}

export interface ValidationStats {
  totalValidations: number;
  successfulValidations: number;
  failedValidations: number;
  duplicateValidations: number;
  expiredValidations: number;
  invalidTicketValidations: number;
}

/**
 * Service for validating tickets at entry points
 */
export class ValidationService {
  
  /**
   * Validate a ticket by QR code hash
   */
  static async validateTicketByHash(
    qrCodeHash: string, 
    validatorId: string,
    entryLocation?: string,
    deviceInfo?: string
  ): Promise<ValidationResult> {
    try {
      // Find ticket by QR code hash
      const ticket = await Ticket.findOne({ qrCodeHash })
        .populate('event', 'title startsAt stadium')
        .populate('user', 'firstName lastName email');
      
      if (!ticket) {
        return {
          valid: false,
          error: 'Ticket not found',
          message: 'No ticket found with this QR code'
        };
      }
      
      // Check if ticket is active
      if (ticket.status !== TicketStatus.ACTIVE) {
        let errorMessage = 'Ticket is not valid';
        if (ticket.status === TicketStatus.USED) {
          errorMessage = 'Ticket has already been used';
        } else if (ticket.status === TicketStatus.CANCELLED) {
          errorMessage = 'Ticket has been cancelled';
        } else if (ticket.status === TicketStatus.REFUNDED) {
          errorMessage = 'Ticket has been refunded';
        }
        
        return {
          valid: false,
          error: errorMessage,
          ticket,
          message: errorMessage
        };
      }
      
      // Check if event is still valid (not in the past)
      const now = new Date();
      const event = ticket.event as any;
      if (event.startsAt < now) {
        return {
          valid: false,
          error: 'Event has already started',
          ticket,
          message: 'This event has already started'
        };
      }
      
      // Mark ticket as used
      ticket.status = TicketStatus.USED;
      ticket.usedAt = new Date();
      ticket.usedBy = new mongoose.Types.ObjectId(validatorId);
      ticket.entryLocation = entryLocation;
      ticket.deviceInfo = deviceInfo;
      await ticket.save();
      
      return {
        valid: true,
        ticket,
        message: 'Ticket validated successfully',
        details: {
          ticketNumber: ticket.ticketNumber,
          eventTitle: event.title,
          userName: `${(ticket.user as any).firstName} ${(ticket.user as any).lastName}`,
          category: ticket.ticketCategory,
          price: ticket.price,
          usedAt: ticket.usedAt,
          entryLocation: ticket.entryLocation
        }
      };
      
    } catch (error) {
      console.error('Validation error:', error);
      return {
        valid: false,
        error: 'Validation failed',
        message: 'An error occurred during validation'
      };
    }
  }
  
  /**
   * Validate a ticket by QR code data
   */
  static async validateTicketByQRData(
    qrData: any,
    validatorId: string,
    entryLocation?: string,
    deviceInfo?: string
  ): Promise<ValidationResult> {
    try {
      // Validate QR code data format
      const validation = QRCodeService.validateQRCodeData(qrData);
      if (!validation.valid) {
        return {
          valid: false,
          error: validation.error,
          message: 'Invalid QR code format'
        };
      }
      
      // Find ticket by ID
      const ticket = await Ticket.findById(qrData.ticketId)
        .populate('event', 'title startsAt stadium')
        .populate('user', 'firstName lastName email');
      
      if (!ticket) {
        return {
          valid: false,
          error: 'Ticket not found',
          message: 'No ticket found with this ID'
        };
      }
      
      // Verify QR code hash matches
      if (ticket.qrCodeHash !== qrData.hash) {
        return {
          valid: false,
          error: 'QR code hash mismatch',
          message: 'QR code data does not match ticket'
        };
      }
      
      // Use the hash-based validation
      return await this.validateTicketByHash(
        ticket.qrCodeHash,
        validatorId,
        entryLocation,
        deviceInfo
      );
      
    } catch (error) {
      console.error('QR data validation error:', error);
      return {
        valid: false,
        error: 'Validation failed',
        message: 'An error occurred during validation'
      };
    }
  }
  
  /**
   * Validate a ticket by ticket number (for manual entry)
   */
  static async validateTicketByNumber(
    ticketNumber: string,
    validatorId: string,
    entryLocation?: string,
    deviceInfo?: string
  ): Promise<ValidationResult> {
    try {
      const ticket = await Ticket.findOne({ ticketNumber })
        .populate('event', 'title startsAt stadium')
        .populate('user', 'firstName lastName email');
      
      if (!ticket) {
        return {
          valid: false,
          error: 'Ticket not found',
          message: 'No ticket found with this number'
        };
      }
      
      // Use the hash-based validation
      return await this.validateTicketByHash(
        ticket.qrCodeHash,
        validatorId,
        entryLocation,
        deviceInfo
      );
      
    } catch (error) {
      console.error('Ticket number validation error:', error);
      return {
        valid: false,
        error: 'Validation failed',
        message: 'An error occurred during validation'
      };
    }
  }
  
  /**
   * Get validation statistics for an event
   */
  static async getEventValidationStats(eventId: string): Promise<ValidationStats> {
    try {
      const [
        totalTickets,
        usedTickets,
        activeTickets,
        cancelledTickets,
        refundedTickets
      ] = await Promise.all([
        Ticket.countDocuments({ event: eventId }),
        Ticket.countDocuments({ event: eventId, status: TicketStatus.USED }),
        Ticket.countDocuments({ event: eventId, status: TicketStatus.ACTIVE }),
        Ticket.countDocuments({ event: eventId, status: TicketStatus.CANCELLED }),
        Ticket.countDocuments({ event: eventId, status: TicketStatus.REFUNDED })
      ]);
      
      return {
        totalValidations: usedTickets,
        successfulValidations: usedTickets,
        failedValidations: 0, // This would need to be tracked separately
        duplicateValidations: 0, // This would need to be tracked separately
        expiredValidations: 0, // This would need to be tracked separately
        invalidTicketValidations: 0 // This would need to be tracked separately
      };
      
    } catch (error) {
      console.error('Failed to get validation stats:', error);
      throw error;
    }
  }
  
  /**
   * Get validation history for an event
   */
  static async getEventValidationHistory(
    eventId: string,
    limit: number = 100
  ): Promise<any[]> {
    try {
      const validations = await Ticket.find({
        event: eventId,
        status: TicketStatus.USED
      })
        .populate('user', 'firstName lastName email')
        .populate('usedBy', 'firstName lastName email')
        .select('ticketNumber ticketCategory price usedAt entryLocation deviceInfo')
        .sort({ usedAt: -1 })
        .limit(limit)
        .lean();
      
      return validations.map(ticket => ({
        ticketNumber: ticket.ticketNumber,
        category: ticket.ticketCategory,
        price: ticket.price,
        userName: `${(ticket.user as any).firstName} ${(ticket.user as any).lastName}`,
        userEmail: (ticket.user as any).email,
        validatedBy: ticket.usedBy ? `${(ticket.usedBy as any).firstName} ${(ticket.usedBy as any).lastName}` : 'Unknown',
        validatedAt: ticket.usedAt,
        entryLocation: ticket.entryLocation,
        deviceInfo: ticket.deviceInfo
      }));
      
    } catch (error) {
      console.error('Failed to get validation history:', error);
      throw error;
    }
  }
  
  /**
   * Check if a ticket can be validated (without actually validating it)
   */
  static async checkTicketValidationStatus(ticketId: string): Promise<{
    canValidate: boolean;
    reason?: string;
    ticket?: any;
  }> {
    try {
      const ticket = await Ticket.findById(ticketId)
        .populate('event', 'title startsAt')
        .populate('user', 'firstName lastName email');
      
      if (!ticket) {
        return {
          canValidate: false,
          reason: 'Ticket not found'
        };
      }
      
      if (ticket.status !== TicketStatus.ACTIVE) {
        return {
          canValidate: false,
          reason: 'Ticket is not active',
          ticket
        };
      }
      
      const now = new Date();
      const event = ticket.event as any;
      if (event.startsAt < now) {
        return {
          canValidate: false,
          reason: 'Event has already started',
          ticket
        };
      }
      
      return {
        canValidate: true,
        ticket
      };
      
    } catch (error) {
      console.error('Failed to check ticket validation status:', error);
      return {
        canValidate: false,
        reason: 'Error checking ticket status'
      };
    }
  }
}
