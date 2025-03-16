import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from './ui/Card';
import Chart from './ui/Chart';

interface AnalysisResult {
  averageRating: number;
  reviewCount: number;
  sentiments: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

interface Props {
  placeId: string;
}

export const CompetitiveAnalysisDashboard: React.FC<Props> = ({ placeId }) => {
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/places/${placeId}/analysis`);
        if (!response.ok) {
          throw new Error('Failed to fetch analysis data');
        }
        const data = await response.json();
        setAnalysisData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [placeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-indigo"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="glass" className="p-6 border-red-200 bg-red-50">
        <p className="text-red-700">{error}</p>
      </Card>
    );
  }

  if (!analysisData) {
    return (
      <Card variant="glass" className="p-6 border-yellow-200 bg-yellow-50">
        <p className="text-yellow-700">No analysis data available</p>
      </Card>
    );
  }

  const chartData = [
    {
      name: 'Positive',
      value: analysisData.sentiments.positive,
      color: '#22c55e' // Green
    },
    {
      name: 'Neutral',
      value: analysisData.sentiments.neutral,
      color: '#eab308' // Yellow
    },
    {
      name: 'Negative',
      value: analysisData.sentiments.negative,
      color: '#ef4444' // Red
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card variant="glass" className="p-6">
          <h3 className="text-lg font-semibold mb-2">Average Rating</h3>
          <div className="text-4xl font-bold text-primary-indigo">
            {analysisData.averageRating.toFixed(1)}
          </div>
        </Card>

        <Card variant="glass" className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Reviews</h3>
          <div className="text-4xl font-bold text-primary-indigo">
            {analysisData.reviewCount}
          </div>
        </Card>

        <Card variant="glass" className="p-6">
          <h3 className="text-lg font-semibold mb-2">Positive Ratio</h3>
          <div className="text-4xl font-bold text-primary-indigo">
            {Math.round((analysisData.sentiments.positive / analysisData.reviewCount) * 100)}%
          </div>
        </Card>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card variant="glass" className="p-6">
          <Chart 
            title="Sentiment Distribution" 
            data={chartData} 
          />
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-end gap-4"
      >
        <button
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Export Data
        </button>
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-primary-indigo rounded-md hover:bg-primary-indigo/90"
        >
          Share Analysis
        </button>
      </motion.div>
    </div>
  );
};

export default CompetitiveAnalysisDashboard;