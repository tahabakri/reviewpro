import express, { Express, RequestHandler, ErrorRequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { Server as HttpServer } from 'http';
import { Redis } from 'ioredis';
import { ReviewWebSocketHandler } from './services/data-collection/websocket-handler';
import { notificationService, validateNotificationConfig } from './services/notifications';
import { SentimentAlertService } from './services/alerts/sentiment-alerts';
import { SentimentAnalyzer } from './services/sentiment/analyzer';
import { createAlertRouter } from './routes/alerts';
import { GeminiClient } from './services/gemini/client';

export class Application {
  private app: Express;
  private server: HttpServer;
  private redis!: Redis;
  private wsHandler!: ReviewWebSocketHandler;
  private sentimentAnalyzer!: SentimentAnalyzer;
  private sentimentAlertService!: SentimentAlertService;

  constructor() {
    this.app = express();
    this.server = new HttpServer(this.app);
    this.setupMiddleware();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors());
    
    // Performance middleware
    this.app.use(compression() as unknown as express.RequestHandler);
    this.app.use(express.json());

    // Request logging
    const requestLogger: RequestHandler = (req, _res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    };
    this.app.use(requestLogger);
  }

  async initialize(): Promise<void> {
    try {
      // Validate required environment variables
      if (!process.env.REDIS_URL) {
        throw new Error('REDIS_URL is required');
      }
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is required');
      }

      // Initialize Redis connection
      this.redis = new Redis(process.env.REDIS_URL);

      // Initialize Gemini client
      const geminiClient = new GeminiClient({
        apiKey: process.env.GEMINI_API_KEY,
        maxRetries: 3,
        retryDelay: 1000
      });

      // Initialize sentiment analyzer
      this.sentimentAnalyzer = new SentimentAnalyzer(
        geminiClient,
        this.redis,
        3600 // 1 hour cache TTL
      );

      // Initialize WebSocket handler
      this.wsHandler = new ReviewWebSocketHandler(this.server, {
        redis: this.redis,
        analyzer: this.sentimentAnalyzer
      });

      // Initialize notification service
      validateNotificationConfig();
      await notificationService.initialize();

      // Initialize alert service
      this.sentimentAlertService = new SentimentAlertService(this.redis, {
        thresholds: {
          sentimentDrop: 0.2,
          negativeSpike: 0.3,
          volumeIncrease: 2,
          timeWindow: 3600000
        },
        checkInterval: 60000
      });
      
      // Start monitoring for all subscribed places
      const placesToMonitor = await this.getPlacesToMonitor();
      if (placesToMonitor.length > 0) {
        await this.sentimentAlertService.startMonitoring(placesToMonitor[0]);
      }

      // Set up routes
      this.setupRoutes();

      console.log('Application initialized successfully');
    } catch (error) {
      console.error('Failed to initialize application:', error);
      throw error;
    }
  }

  private async getPlacesToMonitor(): Promise<string[]> {
    try {
      const subscriptionKeys = await this.redis.keys('alert:subscriptions:*');
      return subscriptionKeys.map(key => key.replace('alert:subscriptions:', ''));
    } catch (error) {
      console.error('Failed to get places to monitor:', error);
      return [];
    }
  }

  private setupRoutes(): void {
    // API routes
    this.app.use('/api/alerts', createAlertRouter(this.redis));

    // Health check
    const healthCheckHandler: RequestHandler = (_req, res) => {
      res.json({ status: 'ok' });
    };
    this.app.get('/health', healthCheckHandler);

    // Error handling with correct Express error handler signature
    const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
      console.error('Unhandled error:', err);
      res.status(500).json({ error: 'Internal server error' });
      next();
    };
    this.app.use(errorHandler);
  }

  async start(port: number = 3000): Promise<void> {
    try {
      await this.initialize();
      
      this.server.listen(port, () => {
        console.log(`Server listening on port ${port}`);
      });

      // Graceful shutdown
      process.on('SIGTERM', () => this.shutdown());
      process.on('SIGINT', () => this.shutdown());
    } catch (error) {
      console.error('Failed to start application:', error);
      process.exit(1);
    }
  }

  async shutdown(): Promise<void> {
    console.log('Shutting down application...');

    try {
      // Stop the alert service
      if (this.sentimentAlertService) {
        this.sentimentAlertService.stopMonitoring();
      }
      
      // Close WebSocket connections
      if (this.wsHandler) {
        await new Promise<void>((resolve) => {
          this.server.close(() => resolve());
        });
      }

      // Close Redis connection
      if (this.redis) {
        await this.redis.quit();
      }

      console.log('Application shutdown complete');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  }

  getServer(): Express {
    return this.app;
  }

  getHttpServer(): HttpServer {
    return this.server;
  }
}

// Export singleton instance
export const app = new Application();