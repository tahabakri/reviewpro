import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { Server as HttpServer } from 'http';
import { Redis } from 'ioredis';
import { ReviewWebSocketHandler } from './services/data-collection/websocket-handler';
import { notificationService, validateNotificationConfig } from './services/notifications';
import { SentimentAlertService } from './services/alerts/sentiment-alerts';
import { createAlertRouter } from './routes/alerts';

export class Application {
  private app: Express;
  private server: HttpServer;
  private redis: Redis;
  private wsHandler: ReviewWebSocketHandler;
  private alertService: SentimentAlertService;

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
    this.app.use(compression());
    this.app.use(express.json());

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  async initialize(): Promise<void> {
    try {
      // Initialize Redis connection
      this.redis = new Redis(process.env.REDIS_URL);

      // Initialize WebSocket handler
      this.wsHandler = new ReviewWebSocketHandler(this.server, {
        redis: this.redis,
        analyzer: this.sentimentAnalyzer
      });

      // Initialize notification service
      validateNotificationConfig();
      await notificationService.initialize();

      // Initialize alert service
      this.alertService = new SentimentAlertService(this.redis);

      // Set up routes
      this.setupRoutes();

      console.log('Application initialized successfully');
    } catch (error) {
      console.error('Failed to initialize application:', error);
      throw error;
    }
  }

  private setupRoutes(): void {
    // API routes
    this.app.use('/api/alerts', createAlertRouter(this.redis));

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok' });
    });

    // Error handling
    this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Unhandled error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
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