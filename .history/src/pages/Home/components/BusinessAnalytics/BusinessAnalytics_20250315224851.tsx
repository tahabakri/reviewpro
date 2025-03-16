import React from 'react';
import { motion } from 'framer-motion';
import Card from '../../../../components/ui/Card';

interface BusinessDetails {
  overallRating: number;
  reviewCount: number;
  sentimentAnalysis: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

interface BusinessAnalyticsProps {
  details: BusinessDetails;
}

const slideUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const SentimentBar: React.FC<{
  label: string;
  value: number;
  color: string;
}> = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span>{label}</span>
      <span>{(value * 100).toFixed(1)}%</span>
    </div>
    <div className="h-2 bg-gray-200 rounded-full">
      <div
        className={`h-full ${color} rounded-full`}
        style={{ width: `${value * 100}%` }}
      />
    </div>
  </div>
);

const BusinessAnalytics: React.FC<BusinessAnalyticsProps> = ({ details }) => {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={staggerContainer}
    >
      <motion.div variants={slideUp}>
        <Card variant="glass" className="p-8 h-full">
          <h3 className="text-2xl font-bold font-heading mb-4">Overall Rating</h3>
          <div className="text-5xl font-bold text-primary-indigo">
            {details.overallRating.toFixed(1)}
          </div>
          <div className="text-gray-600 dark:text-gray-300">
            Based on {details.reviewCount} reviews
          </div>
        </Card>
      </motion.div>

      <motion.div variants={slideUp}>
        <Card variant="glass" className="p-8 h-full">
          <h3 className="text-2xl font-bold font-heading mb-4">Sentiment Analysis</h3>
          <div className="space-y-4">
            <SentimentBar
              label="Positive"
              value={details.sentimentAnalysis.positive}
              color="bg-green-500"
            />
            <SentimentBar
              label="Neutral"
              value={details.sentimentAnalysis.neutral}
              color="bg-yellow-500"
            />
            <SentimentBar
              label="Negative"
              value={details.sentimentAnalysis.negative}
              color="bg-red-500"
            />
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default BusinessAnalytics;