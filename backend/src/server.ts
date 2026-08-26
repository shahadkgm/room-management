import dotenv from "dotenv";
import { createContainer } from "./container";
import { createApp } from "./app";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    console.log("🚀 Initializing Dependency Injection Container...");
    const container = await createContainer();
    const app = createApp(container);

    app.listen(PORT, () => {
      console.log(`🏥 Room Harmony Backend running on http://localhost:${PORT}`);
      console.log(`   - Health check: http://localhost:${PORT}/api/health`);
      console.log(`   - Rooms: http://localhost:${PORT}/api/rooms`);
      console.log(`   - Dashboard stats: http://localhost:${PORT}/api/dashboard/stats`);
    });
  } catch (error) {
    console.error("❌ Failed to bootstrap application:", error);
    process.exit(1);
  }
}

bootstrap();