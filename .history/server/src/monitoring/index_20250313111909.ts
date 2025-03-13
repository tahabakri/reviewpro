import promClient from 'prom-client';
import { Request, Response, NextFunction } from 'express';
import { queues } from '../config';

// Initialize Prometheus metrics
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'competitive_analysis_' });

// Custom metrics
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5], // in seconds
});

const apiRequestsTotal = new promClient.Counter({
  name: 'api_requests_total',
  help: 'Total number of API requests made',
  labelNames: ['method', 'endpoint'],
});

const dataCollectionJobsTotal = new promClient.Counter({
  name: 'data_collection_jobs_total',
  help: 'Total number of data collection jobs',
  labelNames: ['platform', 'status'],
});

const reviewsProcessedTotal = new promClient.Counter({
  name: 'reviews_processed_total',
  help: 'Total number of reviews processed',
  labelNames: ['platform'],
});

const queueSize = new promClient.Gauge({
  name: 'job_queue_size',
  help: 'Current size of job queues',
  labelNames: ['queue'],
});

const sentimentAnalysisLatency = new promClient.Histogram({
  name: 'sentiment_analysis_duration_seconds',
  help: 'Duration of sentiment analysis operations',
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

// Monitoring middleware
export const monitorRoute = (routeName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    
    // Record API request
    apiRequestsTotal.inc({ method: req.method, endpoint: routeName });
    
    // Record response time on finish
    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000; // Convert to seconds
      httpRequestDurationMicroseconds
        .labels(req.method, routeName, res.statusCode.toString())
        .observe(duration);
    });
    
    next();
  };
};

// Queue monitoring
async function updateQueueMetrics() {
  try {
    for (const [name, queue] of Object.entries(queues)) {
      const jobCounts = await queue.getJobCounts();
      queueSize.set({ queue: name }, jobCounts.waiting + jobCounts.active);
    }
  } catch (error) {
    console.error('Error updating queue metrics:', error);
  }
}

// Start queue monitoring
setInterval(updateQueueMetrics, 5000); // Update every 5 seconds

// Metrics endpoint handler
export const metricsHandler = async (_req: Request, res: Response) => {
  try {
    res.set('Content-Type', promClient.register.contentType);
    const metrics = await promClient.register.metrics();
    res.send(metrics);
  } catch (error) {
    console.error('Error generating metrics:', error);
    res.status(500).send('Error generating metrics');
  }
};

// Helper functions for tracking metrics
export const monitoring = {
  trackDataCollection: (platform: string, status: 'success' | 'error') => {
    dataCollectionJobsTotal.inc({ platform, status });
  },
  
  trackReviewProcessing: (platform: string) => {
    reviewsProcessedTotal.inc({ platform });
  },
  
  trackSentimentAnalysis: (durationMs: number) => {
    sentimentAnalysisLatency.observe(durationMs / 1000); // Convert to seconds
  },
};

export const MetricNames = {
  HTTP_DURATION: 'http_request_duration_seconds',
  API_REQUESTS: 'api_requests_total',
  DATA_COLLECTION_JOBS: 'data_collection_jobs_total',
  REVIEWS_PROCESSED: 'reviews_processed_total',
  QUEUE_SIZE: 'job_queue_size',
  SENTIMENT_ANALYSIS_LATENCY: 'sentiment_analysis_duration_seconds',
} as const;