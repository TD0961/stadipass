import QRCode from 'qrcode';
import { Ticket } from '../models/Ticket';
import { Event } from '../models/Event';
import { User } from '../models/User';

export interface QRCodeData {
  ticketId: string;
  ticketNumber: string;
  eventId: string;
  userId: string;
  timestamp: string;
  hash: string;
}

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Service for generating and managing QR codes for tickets
 */
export class QRCodeService {
  
  /**
   * Generate QR code data for a ticket
   */
  static generateQRCodeData(ticket: any): QRCodeData {
    return {
      ticketId: ticket._id.toString(),
      ticketNumber: ticket.ticketNumber,
      eventId: ticket.event.toString(),
      userId: ticket.user.toString(),
      timestamp: new Date().toISOString(),
      hash: ticket.qrCodeHash
    };
  }
  
  /**
   * Generate QR code as data URL (base64 image)
   */
  static async generateQRCodeDataURL(
    ticket: any, 
    options: QRCodeOptions = {}
  ): Promise<string> {
    const qrData = this.generateQRCodeData(ticket);
    const qrString = JSON.stringify(qrData);
    
    const defaultOptions = {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M' as const
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
      return await QRCode.toDataURL(qrString, finalOptions);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }
  
  /**
   * Generate QR code as SVG string
   */
  static async generateQRCodeSVG(
    ticket: any, 
    options: QRCodeOptions = {}
  ): Promise<string> {
    const qrData = this.generateQRCodeData(ticket);
    const qrString = JSON.stringify(qrData);
    
    const defaultOptions = {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M' as const
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
      return await QRCode.toString(qrString, { 
        type: 'svg', 
        ...finalOptions 
      });
    } catch (error) {
      console.error('Failed to generate QR code SVG:', error);
      throw new Error('Failed to generate QR code SVG');
    }
  }
  
  /**
   * Generate QR code as PNG buffer
   */
  static async generateQRCodeBuffer(
    ticket: any, 
    options: QRCodeOptions = {}
  ): Promise<Buffer> {
    const qrData = this.generateQRCodeData(ticket);
    const qrString = JSON.stringify(qrData);
    
    const defaultOptions = {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M' as const
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
      return await QRCode.toBuffer(qrString, finalOptions);
    } catch (error) {
      console.error('Failed to generate QR code buffer:', error);
      throw new Error('Failed to generate QR code buffer');
    }
  }
  
  /**
   * Validate QR code data
   */
  static validateQRCodeData(qrData: any): { valid: boolean; error?: string } {
    try {
      // Check required fields
      const requiredFields = ['ticketId', 'ticketNumber', 'eventId', 'userId', 'timestamp', 'hash'];
      for (const field of requiredFields) {
        if (!qrData[field]) {
          return { valid: false, error: `Missing required field: ${field}` };
        }
      }
      
      // Validate timestamp (should be within last 30 days)
      const timestamp = new Date(qrData.timestamp);
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      
      if (timestamp < thirtyDaysAgo) {
        return { valid: false, error: 'QR code is too old' };
      }
      
      // Validate ObjectId format
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!objectIdRegex.test(qrData.ticketId) || 
          !objectIdRegex.test(qrData.eventId) || 
          !objectIdRegex.test(qrData.userId)) {
        return { valid: false, error: 'Invalid ID format' };
      }
      
      return { valid: true };
      
    } catch (error) {
      return { valid: false, error: 'Invalid QR code data format' };
    }
  }
  
  /**
   * Generate ticket with QR code for display
   */
  static async generateTicketWithQRCode(ticketId: string): Promise<{
    ticket: any;
    qrCodeDataURL: string;
    qrCodeSVG: string;
  }> {
    const ticket = await Ticket.findById(ticketId)
      .populate('event', 'title startsAt stadium')
      .populate('user', 'firstName lastName email')
      .populate('order', 'orderNumber');
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    const [qrCodeDataURL, qrCodeSVG] = await Promise.all([
      this.generateQRCodeDataURL(ticket),
      this.generateQRCodeSVG(ticket)
    ]);
    
    return {
      ticket,
      qrCodeDataURL,
      qrCodeSVG
    };
  }
  
  /**
   * Generate multiple QR codes for an order
   */
  static async generateOrderQRCodes(orderId: string): Promise<Array<{
    ticket: any;
    qrCodeDataURL: string;
    qrCodeSVG: string;
  }>> {
    const tickets = await Ticket.find({ order: orderId })
      .populate('event', 'title startsAt stadium')
      .populate('user', 'firstName lastName email')
      .populate('order', 'orderNumber');
    
    const results = [];
    
    for (const ticket of tickets) {
      const [qrCodeDataURL, qrCodeSVG] = await Promise.all([
        this.generateQRCodeDataURL(ticket),
        this.generateQRCodeSVG(ticket)
      ]);
      
      results.push({
        ticket,
        qrCodeDataURL,
        qrCodeSVG
      });
    }
    
    return results;
  }
  
  /**
   * Generate QR code for ticket validation (simplified format)
   */
  static async generateValidationQRCode(ticket: any): Promise<string> {
    // Simplified QR code data for faster scanning
    const validationData = {
      t: ticket.ticketNumber,
      h: ticket.qrCodeHash,
      ts: Math.floor(Date.now() / 1000) // Unix timestamp
    };
    
    try {
      return await QRCode.toDataURL(JSON.stringify(validationData), {
        width: 128,
        margin: 1,
        errorCorrectionLevel: 'L'
      });
    } catch (error) {
      console.error('Failed to generate validation QR code:', error);
      throw new Error('Failed to generate validation QR code');
    }
  }
}
