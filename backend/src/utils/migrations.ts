import mongoose from "mongoose";
import { Order } from "../models/Order";
import { Ticket } from "../models/Ticket";
import { Event } from "../models/Event";

/**
 * Database migration utilities for ticket system
 */
export class DatabaseMigrations {
  
  /**
   * Run all pending migrations
   */
  static async runMigrations(): Promise<void> {
    console.log("🔄 Running database migrations...");
    
    try {
      // Ensure indexes are created
      await this.createIndexes();
      
      // Clean up any expired orders (optional)
      await this.cleanupExpiredOrders();
      
      console.log("✅ Database migrations completed successfully");
    } catch (error) {
      console.error("❌ Migration failed:", error);
      throw error;
    }
  }
  
  /**
   * Create all necessary indexes for optimal performance
   */
  static async createIndexes(): Promise<void> {
    console.log("📊 Creating database indexes...");
    
    try {
      // Order indexes - using ensureIndex to avoid conflicts
      await this.ensureIndex(Order.collection, { orderNumber: 1 }, { unique: true });
      await this.ensureIndex(Order.collection, { user: 1, createdAt: -1 });
      await this.ensureIndex(Order.collection, { event: 1, status: 1 });
      await this.ensureIndex(Order.collection, { status: 1, paymentStatus: 1 });
      await this.ensureIndex(Order.collection, { expiresAt: 1 }, { expireAfterSeconds: 0 });
      
      // Ticket indexes - using ensureIndex to avoid conflicts
      await this.ensureIndex(Ticket.collection, { ticketNumber: 1 }, { unique: true });
      await this.ensureIndex(Ticket.collection, { qrCode: 1 }, { unique: true });
      await this.ensureIndex(Ticket.collection, { qrCodeHash: 1 }, { unique: true });
      await this.ensureIndex(Ticket.collection, { order: 1 });
      await this.ensureIndex(Ticket.collection, { user: 1, event: 1 });
      await this.ensureIndex(Ticket.collection, { event: 1, status: 1 });
      await this.ensureIndex(Ticket.collection, { status: 1, event: 1 });
      
      console.log("✅ Database indexes created successfully");
    } catch (error) {
      console.error("❌ Index creation failed:", error);
      throw error;
    }
  }

  /**
   * Safely create an index, handling conflicts gracefully
   */
  private static async ensureIndex(collection: any, indexSpec: any, options: any = {}): Promise<void> {
    try {
      await collection.createIndex(indexSpec, options);
    } catch (error: any) {
      // If index already exists with different options, try to drop and recreate
      if (error.code === 85 || error.codeName === 'IndexOptionsConflict') {
        console.log(`⚠️  Index conflict detected, attempting to recreate: ${JSON.stringify(indexSpec)}`);
        try {
          // Get the index name
          const indexName = this.getIndexName(indexSpec);
          if (indexName) {
            await collection.dropIndex(indexName);
            await collection.createIndex(indexSpec, options);
            console.log(`✅ Successfully recreated index: ${indexName}`);
          }
        } catch (recreateError) {
          const message = (recreateError as any)?.message || String(recreateError);
          console.warn(`⚠️  Could not recreate index ${JSON.stringify(indexSpec)}:`, message);
          // Continue with other indexes
        }
      } else if (error.code === 11000 || error.codeName === 'DuplicateKey') {
        // Index already exists, that's fine
        console.log(`ℹ️  Index already exists: ${JSON.stringify(indexSpec)}`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Generate index name from index specification
   */
  private static getIndexName(indexSpec: any): string | null {
    const keys = Object.keys(indexSpec);
    if (keys.length === 1) {
      return `${keys[0]}_1`;
    } else if (keys.length > 1) {
      return keys.map(key => `${key}_${indexSpec[key]}`).join('_');
    }
    return null;
  }
  
  /**
   * Clean up expired orders (orders that expired more than 24 hours ago)
   */
  static async cleanupExpiredOrders(): Promise<void> {
    console.log("🧹 Cleaning up expired orders...");
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - 24); // 24 hours ago
      
      const result = await Order.deleteMany({
        status: "pending",
        expiresAt: { $lt: cutoffDate }
      });
      
      if (result.deletedCount > 0) {
        console.log(`✅ Cleaned up ${result.deletedCount} expired orders`);
      } else {
        console.log("✅ No expired orders to clean up");
      }
    } catch (error) {
      console.error("❌ Cleanup failed:", error);
      throw error;
    }
  }
  
  /**
   * Get database statistics
   */
  static async getStats(): Promise<any> {
    try {
      const [orderStats, ticketStats, eventStats] = await Promise.all([
        Order.aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              totalAmount: { $sum: "$totalAmount" }
            }
          }
        ]),
        Ticket.aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 }
            }
          }
        ]),
        Event.countDocuments({ isPublished: true })
      ]);
      
      return {
        orders: orderStats,
        tickets: ticketStats,
        publishedEvents: eventStats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("❌ Failed to get stats:", error);
      throw error;
    }
  }
  
  /**
   * Validate database integrity
   */
  static async validateIntegrity(): Promise<boolean> {
    console.log("🔍 Validating database integrity...");
    
    try {
      // Check for orphaned tickets (tickets without valid orders)
      const orphanedTickets = await Ticket.countDocuments({
        order: { $exists: true },
        $expr: {
          $not: {
            $in: ["$order", { $map: { input: { $objectToArray: "$$ROOT" }, as: "item", in: "$$item.v" } }]
          }
        }
      });
      
      if (orphanedTickets > 0) {
        console.warn(`⚠️  Found ${orphanedTickets} orphaned tickets`);
        return false;
      }
      
      // Check for tickets with invalid event references
      const invalidEventTickets = await Ticket.countDocuments({
        event: { $exists: true },
        $expr: {
          $not: {
            $in: ["$event", { $map: { input: { $objectToArray: "$$ROOT" }, as: "item", in: "$$item.v" } }]
          }
        }
      });
      
      if (invalidEventTickets > 0) {
        console.warn(`⚠️  Found ${invalidEventTickets} tickets with invalid event references`);
        return false;
      }
      
      console.log("✅ Database integrity validation passed");
      return true;
    } catch (error) {
      console.error("❌ Integrity validation failed:", error);
      return false;
    }
  }
}
