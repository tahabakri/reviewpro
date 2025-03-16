import React from 'react';
import { motion } from 'framer-motion';
import Card from '../../../../components/ui/Card';
import SentimentBar from '../../../../components/ui/SentimentBar';
import { staggerContainer, slideUp } from '../../../../utils/animations';
import { BusinessDetails } from '../../../../types/business';

interface BusinessAnalyticsProps {
  details: BusinessDetails;
}

const BusinessAnalytics: React.FC<BusinessAnalyticsProps> = ({ details }) => (
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
