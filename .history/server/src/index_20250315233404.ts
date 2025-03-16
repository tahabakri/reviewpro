import { config } from 'dotenv';
import { resolve } from 'path';
import { app } from './app';

// Load environment variables from the root .env file
config({ path: resolve(__dirname, '../../.env') });

// Define port with fallback
const PORT = parseInt(process.env.PORT || '3000', 10);

// Start server
app.start(PORT).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  app.shutdown().catch(() => process.exit(1));
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  app.shutdown().catch(() => process.exit(1));
});

// Export app for testing
export default app;