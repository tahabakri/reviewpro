import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import { SentimentAlert, AlertThresholds } from '../../types/alerts';

interface Props {
  placeId: string;
  onSubscribe?: (thresholds: AlertThresholds) => void;
  onUnsubscribe?: () => void;
}

export const SentimentAlerts: React.FC<Props> = ({ 
  placeId, 
  onSubscribe,
  onUnsubscribe 
}) => {
  const [alerts, setAlerts] = useState<SentimentAlert[]>([]);
  const [thresholds, setThresholds] = useState<AlertThresholds>({
    sentimentDrop: 0.2,
    negativeSpike: 0.3,
    volumeIncrease: 2,
    timeWindow: 3600000
  });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchAlerts();
    checkSubscriptionStatus();
  }, [placeId]);

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`/api/alerts/${placeId}`);
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const response = await fetch(`/api/alerts/subscription/${placeId}`);
      const data = await response.json();
      setIsSubscribed(data.active);
      if (data.thresholds) {
        setThresholds(data.thresholds);
      }
    } catch (error) {
      console.error('Failed to check subscription status:', error);
    }
  };

  const handleSubscribe = async () => {
    try {
      await onSubscribe?.(thresholds);
      setIsSubscribed(true);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to subscribe:', error);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await onUnsubscribe?.();
      setIsSubscribed(false);
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    }
  };

  const getAlertColor = (type: SentimentAlert['type']) => {
    switch (type) {
      case 'sentiment-drop':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'negative-spike':
        return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'volume-increase':
        return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  return (
    <div className="space-y-6">
      <Card variant="glass" className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Sentiment Alerts</h3>
          {isSubscribed ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm text-primary-indigo hover:text-primary-indigo-dark"
              >
                Edit Thresholds
              </button>
              <button
                onClick={handleUnsubscribe}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Unsubscribe
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-primary-indigo text-white rounded-md hover:bg-primary-indigo-dark"
            >
              Subscribe to Alerts
            </button>
          )}
        </div>

        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sentiment Drop Threshold (%)
                </label>
                <input
                  type="number"
                  value={thresholds.sentimentDrop * 100}
                  onChange={e => setThresholds(prev => ({
                    ...prev,
                    sentimentDrop: Number(e.target.value) / 100
                  }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Negative Spike Threshold (%)
                </label>
                <input
                  type="number"
                  value={thresholds.negativeSpike * 100}
                  onChange={e => setThresholds(prev => ({
                    ...prev,
                    negativeSpike: Number(e.target.value) / 100
                  }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Volume Increase Factor
                </label>
                <input
                  type="number"
                  value={thresholds.volumeIncrease}
                  onChange={e => setThresholds(prev => ({
                    ...prev,
                    volumeIncrease: Number(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Window (hours)
                </label>
                <input
                  type="number"
                  value={thresholds.timeWindow / 3600000}
                  onChange={e => setThresholds(prev => ({
                    ...prev,
                    timeWindow: Number(e.target.value) * 3600000
                  }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="col-span-2">
                <button
                  onClick={handleSubscribe}
                  className="w-full px-4 py-2 bg-primary-indigo text-white rounded-md hover:bg-primary-indigo-dark"
                >
                  {isSubscribed ? 'Update Thresholds' : 'Subscribe'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="space-y-4">
          {alerts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No recent alerts
            </p>
          ) : (
            alerts.map(alert => (
              <motion.div
                key={`${alert.type}-${alert.timestamp.toString()}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm mt-1">
                      Previous: {(alert.data.previous * 100).toFixed(1)}% →{' '}
                      Current: {(alert.data.current * 100).toFixed(1)}%
                    </p>
                  </div>
                  <span className="text-xs">
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};