import mongoose from "mongoose";

export class DatabaseManager {
  private static isConnected = false;

  /**
   * Connects to MongoDB using the URI from environment variables.
   * Throws an error if the connection cannot be established —
   * the application should not start without a working database.
   */
  static async connect(): Promise<void> {
    const mongoUri = (process.env.MONGO_URI || "").trim();

    if (!mongoUri) {
      throw new Error(
        "MONGO_URI is not set in .env. Please add: MONGO_URI=mongodb://localhost:27017/room_harmony"
      );
    }

    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      this.isConnected = true;
      console.log("✅ Connected to MongoDB successfully.");
    } catch (error: any) {
      throw new Error(`MongoDB connection failed: ${error.message}`);
    }
  }

  static getIsConnected(): boolean {
    return this.isConnected;
  }
}
