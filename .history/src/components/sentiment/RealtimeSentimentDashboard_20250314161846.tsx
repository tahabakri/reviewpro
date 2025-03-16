import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import { PieChart, TimelineChart } from './SentimentChart';
import { useSentimentWebSocket, getReviewStats } from '../../hooks/useSentimentWebSocket';

interface Props {
  placeId: string;
}

export const RealtimeSentimentDashboard: React.FC<Props> = ({ placeId }) => {
  const { connected, error, reviews, subscribe, unsubscribe } = useSentimentWebSocket();

  // Subscribe to updates when mounted
  useEffect(() => {
    subscribe(placeId);
    return () => unsubscribe(placeId);
  }, [placeId, subscribe, unsubscribe]);

  // Calculate stats from reviews
  const stats = useMemo(() => getReviewStats(reviews), [reviews]);

  // Early return states
  if (!connected) {
    return (
      <Card variant="glass" className="p-6">
        <div className="flex items-center space-x-3">
          <div className="animate-ping h-3 w-3 rounded-full bg-yellow-400"></div>
          <p className="text-gray-600">Connecting to sentiment analysis service...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="glass" className="p-6 border-red-200 bg-red-50">
        <div className="flex items-center space-x-3">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <p className="text-red-600">{error}</p>
        </div>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card variant="glass" className="p-6">
        <p className="text-gray-600">Waiting for sentiment data...</p>
      </Card>
    );
  }

  const sentimentData = [
    {
      name: 'Positive',
      value: stats.positive,
      color: '#22c55e'
    },
    {
      name: 'Neutral',
      value: stats.neutral,
      color: '#eab308'
    },
    {
      name: 'Negative',
      value: stats.negative,
      color: '#ef4444'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="glass" className="p-6">
          <h3 className="text-lg font-semibold mb-2">Live Sentiment</h3>
          <div className="text-4xl font-bold text-primary-indigo">
            {(stats.averageScore * 100).toFixed(1)}%
          </div>
          <div className="mt-1 text-sm text-gray-500">
            Based on {stats.total} reviews
          </div>
        </Card>

        <Card variant="glass" className="p-6">
          <h3 className="text-lg font-semibold mb-2">Positive Rate</h3>
          <div className="text-4xl font-bold text-green-500">
            {stats.positiveRate.toFixed(1)}%
          </div>
          <div className="mt-1 text-sm text-gray-500">
            {stats.positive} reviews
          </div>
        </Card>

        <Card variant="glass" className="p-6">
          <h3 className="text-lg font-semibold mb-2">Neutral Rate</h3>
          <div className="text-4xl font-bold text-yellow-500">
            {stats.neutralRate.toFixed(1)}%
          </div>
          <div className="mt-1 text-sm text-gray-500">
            {stats.neutral} reviews
          </div>
        </Card>

        <Card variant="glass" className="p-6">
          <h3 className="text-lg font-semibold mb-2">Negative Rate</h3>
          <div className="text-4xl font-bold text-red-500">
            {stats.negativeRate.toFixed(1)}%
          </div>
          <div className="mt-1 text-sm text-gray-500">
            {stats.negative} reviews
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="glass" className="p-6">
          <h3 className="text-lg font-semibold mb-4">Sentiment Distribution</h3>
          <PieChart data={sentimentData} />
        </Card>

        <Card variant="glass" className="p-6">
          <h3 className="text-lg font-semibold mb-4">Latest Reviews</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            <AnimatePresence>
              {reviews.slice(0, 5).map(review => (
                <motion.div
                  key={review.reviewId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`p-4 rounded-lg ${
                    review.sentiment.sentiment === 'positive'
                      ? 'bg-green-50 border border-green-100'
                      : review.sentiment.sentiment === 'negative'
                      ? 'bg-red-50 border border-red-100'
                      : 'bg-yellow-50 border border-yellow-100'
                  }`}
                >
                  <p className="text-sm line-clamp-2">{review.text}</p>
                  <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                    <span>{new Date(review.time).toLocaleString()}</span>
                    <span>
                      Sentiment Score: {(review.sentiment.score * 100).toFixed(1)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </Card>
      </div>

      {/* Connection Status */}
      <div className="fixed bottom-4 right-4">
        <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-600">Live Updates</span>
        </div>
      </div>
    </div>
  );
};