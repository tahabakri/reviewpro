import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Chart from '../ui/Chart';

interface SentimentStats {
  positive: number;
  negative: number;
  neutral: number;
  averageScore: number;
  totalReviews: number;
  topPhrases: Array<{
    text: string;
    frequency: number;
    sentiment: string;
  }>;
}

interface TimelineData {
  date: string;
  sentiment: number;
  volume: number;
}

interface Props {
  placeId: string;
}

export const SentimentDashboard: React.FC<Props> = ({ placeId }) => {
  const [stats, setStats] = useState<SentimentStats | null>(null);
  const [timeline, setTimeline] = useState<TimelineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
  const [selectedSentiment, setSelectedSentiment] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/sentiment/stats/${placeId}?timeRange=${dateRange}`);
        const data = await response.json();
        setStats(data.stats);
        setTimeline(data.timeline);
      } catch (error) {
        console.error('Error fetching sentiment data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [placeId, dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-indigo"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card variant="glass" className="p-6">
        <p className="text-gray-600">No sentiment data available</p>
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
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card variant="glass" className="p-6">
          <h3 className="text-lg font-semibold mb-2">Overall Sentiment</h3>
          <div className="text-4xl font-bold text-primary-indigo">
            {(stats.averageScore * 100).toFixed(1)}%
          </div>
        </Card>

        <Card variant="glass" className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Reviews</h3>
          <div className="text-4xl font-bold text-primary-indigo">
            {stats.totalReviews}
          </div>
        </Card>

        <Card variant="glass" className="p-6">
          <h3 className="text-lg font-semibold mb-2">Positive Rate</h3>
          <div className="text-4xl font-bold text-green-500">
            {((stats.positive / stats.totalReviews) * 100).toFixed(1)}%
          </div>
        </Card>

        <Card variant="glass" className="p-6">
          <h3 className="text-lg font-semibold mb-2">Negative Rate</h3>
          <div className="text-4xl font-bold text-red-500">
            {((stats.negative / stats.totalReviews) * 100).toFixed(1)}%
          </div>
        </Card>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-4"
      >
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as 'week' | 'month' | 'year')}
          className="px-4 py-2 rounded-md border border-gray-300"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>

        <select
          value={selectedSentiment}
          onChange={(e) => setSelectedSentiment(e.target.value as 'all' | 'positive' | 'negative' | 'neutral')}
          className="px-4 py-2 rounded-md border border-gray-300"
        >
          <option value="all">All Reviews</option>
          <option value="positive">Positive Only</option>
          <option value="negative">Negative Only</option>
          <option value="neutral">Neutral Only</option>
        </select>
      </motion.div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card variant="glass" className="p-6">
          <h3 className="text-lg font-semibold mb-4">Sentiment Distribution</h3>
          <Chart
            type="pie"
            data={sentimentData}
          />
        </Card>

        <Card variant="glass" className="p-6">
          <h3 className="text-lg font-semibold mb-4">Sentiment Timeline</h3>
          <Chart
            type="line"
            data={timeline.map(t => ({
              x: t.date,
              y: t.sentiment,
              volume: t.volume
            }))}
          />
        </Card>
      </motion.div>

      {/* Top Phrases */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card variant="glass" className="p-6">
          <h3 className="text-lg font-semibold mb-4">Common Phrases</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {stats.topPhrases.map((phrase, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  phrase.sentiment === 'positive'
                    ? 'bg-green-100 text-green-800'
                    : phrase.sentiment === 'negative'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                <div className="font-medium">{phrase.text}</div>
                <div className="text-sm opacity-75">
                  Frequency: {phrase.frequency}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};