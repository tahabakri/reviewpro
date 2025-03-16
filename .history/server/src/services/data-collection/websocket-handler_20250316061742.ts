import WebSocket from 'ws';
import { Server } from 'http';
import { Redis } from 'ioredis';
import { ReviewCollector } from './review-collector';
import { 
  AnalyzedReviewUpdate, 
  WebSocketClient, 
  WebSocketMessage, 
  WebSocketResponse,
  CollectorDependencies 
} from './types';
import { SentimentAnalyzer } from '../sentiment/analyzer';

export class ReviewWebSocketHandler {
  private wss: WebSocket.Server;
  private collectors: Map<string, ReviewCollector> = new Map();
  private redis: Redis;
  private analyzer: SentimentAnalyzer;

  constructor(
    server: Server,
    dependencies: CollectorDependencies
  ) {
    this.wss = new WebSocket.Server({ server });
    this.redis = dependencies.redis;
    this.analyzer = dependencies.analyzer;
    this.setupWebSocketServer();
  }

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocketClient) => {
      ws.isAlive = true;
      ws.subscribedPlaces = new Set();

      // Handle ping/pong to detect stale connections
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Handle client messages
      ws.on('message', async (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString()) as WebSocketMessage;
          await this.handleClientMessage(ws, message);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
          this.sendError(ws, 'Invalid message format');
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        this.handleClientDisconnect(ws);
      });
    });

    // Setup periodic connection check
    setInterval(() => {
      this.wss.clients.forEach((ws) => {
        const client = ws as WebSocketClient;
        if (!client.isAlive) {
          return ws.terminate();
        }
        client.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  private async handleClientMessage(ws: WebSocketClient, message: WebSocketMessage): Promise<void> {
    switch (message.type) {
      case 'subscribe':
        await this.handleSubscribe(ws, message.placeId);
        break;
      case 'unsubscribe':
        await this.handleUnsubscribe(ws, message.placeId);
        break;
      default:
        this.sendError(ws, 'Unknown message type');
    }
  }

  private async handleSubscribe(ws: WebSocketClient, placeId: string): Promise<void> {
    if (!placeId) {
      this.sendError(ws, 'Place ID is required');
      return;
    }

    // Add to client's subscriptions
    ws.subscribedPlaces.add(placeId);

    // Start collecting if not already collecting
    if (!this.collectors.has(placeId)) {
      const collector = await this.createCollector(placeId);
      this.collectors.set(placeId, collector);
    }

    this.send(ws, {
      type: 'subscribed',
      placeId
    });
  }

  private async handleUnsubscribe(ws: WebSocketClient, placeId: string): Promise<void> {
    ws.subscribedPlaces.delete(placeId);

    // Check if anyone is still subscribed to this place
    let hasSubscribers = false;
    this.wss.clients.forEach((client) => {
      const wsClient = client as WebSocketClient;
      if (wsClient.subscribedPlaces.has(placeId)) {
        hasSubscribers = true;
      }
    });

    // If no more subscribers, stop collecting
    if (!hasSubscribers) {
      const collector = this.collectors.get(placeId);
      if (collector) {
        collector.stopCollecting();
        this.collectors.delete(placeId);
      }
    }

    this.send(ws, {
      type: 'unsubscribed',
      placeId
    });
  }

  private handleClientDisconnect(ws: WebSocketClient): void {
    // Check each place this client was subscribed to
    ws.subscribedPlaces.forEach(placeId => {
      let hasOtherSubscribers = false;
      this.wss.clients.forEach((client) => {
        const wsClient = client as WebSocketClient;
        if (wsClient !== ws && wsClient.subscribedPlaces.has(placeId)) {
          hasOtherSubscribers = true;
        }
      });

      // If no other subscribers, stop collecting
      if (!hasOtherSubscribers) {
        const collector = this.collectors.get(placeId);
        if (collector) {
          collector.stopCollecting();
          this.collectors.delete(placeId);
        }
      }
    });
  }

  private async createCollector(placeId: string): Promise<ReviewCollector> {
    const collector = new ReviewCollector(
      process.env.GOOGLE_MAPS_API_KEY!,
      this.redis,
      this.analyzer
    );

    // Handle review updates
    collector.onReviews((updates: AnalyzedReviewUpdate[]) => {
      this.broadcastReviews(placeId, updates);
    });

    // Handle errors
    collector.onError((error: Error) => {
      this.broadcastError(placeId, error.message);
    });

    // Start collecting
    await collector.startCollecting(placeId);

    return collector;
  }

  private broadcastReviews(placeId: string, updates: AnalyzedReviewUpdate[]): void {
    this.wss.clients.forEach((client) => {
      const wsClient = client as WebSocketClient;
      if (wsClient.subscribedPlaces.has(placeId)) {
        updates.forEach(update => {
          this.send(wsClient, {
            type: 'review.new',
            data: update
          });
        });
      }
    });
  }

  private broadcastError(placeId: string, message: string): void {
    this.wss.clients.forEach((client) => {
      const wsClient = client as WebSocketClient;
      if (wsClient.subscribedPlaces.has(placeId)) {
        this.sendError(wsClient, message);
      }
    });
  }

  private send(ws: WebSocketClient, response: WebSocketResponse): void {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(response));
    }
  }

  private sendError(ws: WebSocketClient, message: string): void {
    this.send(ws, {
      type: 'review.error',
      data: { message }
    });
  }
}