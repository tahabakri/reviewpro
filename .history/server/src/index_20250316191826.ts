import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { app } from './app.js';

// Get current file path in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the server .env file
const envPath = resolve(__dirname, '../.env');
console.log('Loading environment variables from:', envPath);
config({ path: envPath });

// Verify critical environment variables
const requiredEnvVars = ['GOOGLE_PLACES_API_KEY', 'PORT'];
const missingVars = requiredEnvVars.filter(key => !process.env[key]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
  process.exit(1);
}

console.log('Environment variables loaded successfully');

// Define port with fallback
const PORT = parseInt(process.env.PORT || '3000', 10);

// Start server
app.start(PORT).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Handle uncaught errors
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught exception:', error);
  app.shutdown().catch(() => process.exit(1));
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled rejection:', reason);
  app.shutdown().catch(() => process.exit(1));
});

// Export app for testing
export default app;
