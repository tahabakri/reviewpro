import { queues } from './config';
import { etlPipeline } from './services/etl/pipeline';
import { notificationService } from './services/notifications';
import { Review } from './types';

// Process ETL jobs
queues.etl.process(async (job) => {
  const { reviews, entityId } = job.data;
  await etlPipeline.processReviews(reviews, entityId);
});

// Process sentiment analysis jobs
queues.sentiment.process(async (job) => {
  const { reviews, entityId } = job.data;
  const processedReviews = await etlPipeline.processSentiments(reviews, entityId);
  
  // Check for sentiment-based alerts after processing
  await etlPipeline.checkSentimentAlerts(entityId, processedReviews);
  
  return processedReviews;
});

// Process data collection jobs
queues.dataCollection.process(async (job) => {
  const { service, method, params } = job.data;
  return await service[method](...params);
});

// Process notification jobs
queues.notifications.process('send-notification', async (job) => {
  const { businessId, notificationData, channels } = job.data;
  await notificationService.processNotification({
    ...notificationData,
    channels,
    userId: businessId,
  });
});

queues.notifications.process('in-app-notification', async (job) => {
  const { userId, notification } = job.data;
  // Store in-app notification in database
  await storeInAppNotification(userId, notification);
});

// Error handling for all queues
[queues.etl, queues.sentiment, queues.dataCollection, queues.notifications]
  .forEach(queue => {
    queue.on('error', (error) => {
      console.error(`Queue error in ${queue.name}:`, error);
    });

    queue.on('failed', (job, error) => {
      console.error(`Job ${job.id} failed in queue ${queue.name}:`, error);
    });
  });

// Health check and monitoring
async function getQueueMetrics() {
  const metrics: Record<string, unknown> = {};
  
  for (const [name, queue] of Object.entries(queues)) {
    const jobCounts = await queue.getJobCounts();
    metrics[name] = {
      ...jobCounts,
      name: queue.name,
      isPaused: await queue.isPaused(),
    };
  }
  
  return metrics;
}

// Graceful shutdown
async function shutdown() {
  console.log('Shutting down queues...');
  
  await Promise.all(
    Object.values(queues).map(queue => queue.close())
  );
  
  console.log('All queues closed');
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Helper functions
async function storeInAppNotification(userId: string, notification: any) {
  // TODO: Implement storing in-app notifications in the database
  console.log('Storing in-app notification for user:', userId, notification);
}

// Export for testing
export { getQueueMetrics };