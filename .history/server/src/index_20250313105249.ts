import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { scheduler } from './services/scheduler';
import { redisClient } from './config';
import { etlPipeline } from './services/etl/pipeline';

async function startServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(helmet());
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // API routes
  app.use('/api/competitors', require('./routes/competitors'));
  app.use('/api/reviews', require('./routes/reviews'));
  app.use('/api/alerts', require('./routes/alerts'));
  app.use('/api/insights', require('./routes/insights'));

  // Error handling middleware
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  try {
    // Start the scheduler
    scheduler.start();
    console.log('Scheduler started successfully');

    // Start the server
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });

    // Handle graceful shutdown
    const shutdown = async () => {
      console.log('Shutting down gracefully...');
      
      scheduler.stop();
      await redisClient.quit();
      
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer().catch(console.error);

// Export for testing
export default app;