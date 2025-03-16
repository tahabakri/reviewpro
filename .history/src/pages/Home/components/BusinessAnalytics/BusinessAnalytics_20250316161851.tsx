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
    className="grid-2-col"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    variants={staggerContainer}
  >
    <motion.div variants={slideUp}>
      <Card variant="glass" className="card-glass">
        <h3 className="heading-lg mb-4">Overall Rating</h3>
        <div className="text-5xl font-bold text-primary-indigo">
          {details.overallRating.toFixed(1)}
        </div>
        <div className="text-body">
          Based on {details.reviewCount} reviews
        </div>
      </Card>
    </motion.div>

    <motion.div variants={slideUp}>
      <Card variant="glass" className="card-glass">
        <h3 className="heading-lg mb-4">Sentiment Analysis</h3>
        <div className="stack-y-4">
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

export default BusinessAnalytics;
