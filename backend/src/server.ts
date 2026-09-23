import app from './app';
import { config } from './config/env';
import prisma from './lib/prisma';

const server = app.listen(config.port, async () => {
  try {
    // Verify database connectivity on startup
    await prisma.$queryRaw`SELECT 1`;
    console.log(`====================================================`);
    console.log(`🚀 AssetFlow Backend Server running on port ${config.port}`);
    console.log(`🌐 Environment: ${config.nodeEnv}`);
    console.log(`🔌 Database connected: Supabase PostgreSQL`);
    console.log(`🩺 Health check: http://localhost:${config.port}/api/health`);
    console.log(`====================================================`);
  } catch (error) {
    console.error('❌ Database connection error at startup:', error);
  }
});

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('✅ PostgreSQL connection closed. Process terminated.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
