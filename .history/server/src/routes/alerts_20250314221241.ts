import { Router, Request, Response, RequestHandler } from 'express';
import { Redis } from 'ioredis';
import { SentimentAlertService } from '../services/alerts/sentiment-alerts';
import { AlertThresholds } from '../types/alerts';
import { authenticateUser, AuthenticatedUser } from '../middleware/auth';

export function createAlertRouter(redisClient: Redis) {
  const router = Router();
  const alertService = new SentimentAlertService(redisClient);

  /**
   * @route GET /api/alerts/:placeId
   * @description Get recent alerts for a business
   */
  const getAlerts: RequestHandler = async (req, res) => {
    try {
      const alerts = await alertService.getRecentAlerts(req.params.placeId);
      res.json(alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  };
  router.get('/:placeId', authenticateUser, getAlerts);

  /**
   * @route GET /api/alerts/subscription/:placeId
   * @description Get alert subscription status and thresholds
   */
  const getSubscription: RequestHandler = async (req, res) => {
    try {
      // Get subscription for the current user
      const subscription = await redisClient.get(
        `alert:subscription:${(req.user as AuthenticatedUser).id}:${req.params.placeId}`
      );

      if (!subscription) {
        res.json({ active: false });
        return;
      }

      res.json(JSON.parse(subscription));
    } catch (error) {
      console.error('Error fetching subscription:', error);
      res.status(500).json({ error: 'Failed to fetch subscription' });
    }
  };
  router.get('/subscription/:placeId', authenticateUser, getSubscription);

  /**
   * @route POST /api/alerts/subscription/:placeId
   * @description Subscribe to alerts for a business
   */
  const createSubscription: RequestHandler = async (req, res) => {
    try {
      const { thresholds, webhook, email } = req.body;
      
      // Validate thresholds
      validateThresholds(thresholds);

      await alertService.subscribe({
        placeId: req.params.placeId,
        webhook,
        email,
        thresholds
      });

      // Store subscription
      await redisClient.set(
        `alert:subscription:${(req.user as AuthenticatedUser).id}:${req.params.placeId}`,
        JSON.stringify({
          active: true,
          thresholds,
          webhook,
          email
        }),
        'EX',
        30 * 24 * 60 * 60 // 30 days expiry
      );

      res.json({ success: true });
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ error: 'Failed to create subscription' });
    }
  };
  router.post('/subscription/:placeId', authenticateUser, createSubscription);

  /**
   * @route DELETE /api/alerts/subscription/:placeId
   * @description Unsubscribe from alerts for a business
   */
  const deleteSubscription: RequestHandler = async (req, res) => {
    try {
      const subscription = await redisClient.get(
        `alert:subscription:${(req.user as AuthenticatedUser).id}:${req.params.placeId}`
      );

      if (subscription) {
        const { webhook, email } = JSON.parse(subscription);
        
        // Remove from alert service
        await alertService.unsubscribe(req.params.placeId, webhook || email);

        // Remove subscription
        await redisClient.del(
          `alert:subscription:${(req.user as AuthenticatedUser).id}:${req.params.placeId}`
        );
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error removing subscription:', error);
      res.status(500).json({ error: 'Failed to remove subscription' });
    }
  };
  router.delete('/subscription/:placeId', authenticateUser, deleteSubscription);

  return router;
}

function validateThresholds(thresholds: AlertThresholds) {
  if (!thresholds) {
    throw new Error('Thresholds are required');
  }

  const {
    sentimentDrop,
    negativeSpike,
    volumeIncrease,
    timeWindow
  } = thresholds;

  if (
    typeof sentimentDrop !== 'number' ||
    sentimentDrop < 0 ||
    sentimentDrop > 1
  ) {
    throw new Error('Invalid sentiment drop threshold');
  }

  if (
    typeof negativeSpike !== 'number' ||
    negativeSpike < 0 ||
    negativeSpike > 1
  ) {
    throw new Error('Invalid negative spike threshold');
  }

  if (
    typeof volumeIncrease !== 'number' ||
    volumeIncrease < 1
  ) {
    throw new Error('Invalid volume increase threshold');
  }

  if (
    typeof timeWindow !== 'number' ||
    timeWindow < 3600000 || // 1 hour
    timeWindow > 259200000 // 72 hours
  ) {
    throw new Error('Invalid time window');
  }
}