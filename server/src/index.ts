import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { scheduler } from './services/scheduler';
import { redisClient } from './config';

import competitorsRouter from './routes/competitors';
import reviewsRouter from './routes/reviews';
import alertsRouter from './routes/alerts';
import insightsRouter from './routes/insights';

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api/competitors', competitorsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/insights', insightsRouter);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
  next(err);
});

async function startServer() {
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