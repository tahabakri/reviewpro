import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Card from '../../../../components/ui/Card';

interface FeatureStats {
  value: string;
  label: string;
}

interface FeatureProps {
  title: string;
  description: string;
  stats: FeatureStats;
  points: string[];
  icon: ReactNode;
  delay?: number;
}

const slideUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0 }
};

const FeatureCard: React.FC<FeatureProps> = ({
  title,
  description,
  stats,
  points,
  icon,
  delay = 0
}) => {
  return (
    <motion.div 
      variants={slideUp}
      transition={{ delay }}
    >
      <Card
        variant="glass"
        className="h-full hover:shadow-xl transition-all duration-300 hover:border-primary-indigo/30"
        hoverable
      >
        <div className="p-8 md:p-10 h-full flex flex-col">
          <div className="w-14 h-14 rounded-xl glass flex items-center justify-center text-primary-indigo dark:text-primary-purple bg-primary-indigo/10 dark:bg-primary-purple/20 mb-8">
            {icon}
          </div>
          <h3 className="text-2xl font-bold font-heading mb-3">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">{description}</p>
          <div className="mb-8 bg-gradient-to-r from-primary-indigo/5 to-primary-purple/5 p-4 rounded-lg">
            <div className="text-4xl font-bold text-primary-indigo dark:text-primary-purple">
              {stats.value}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stats.label}
            </div>
          </div>
          <ul className="space-y-4 mt-auto">
            {points.map((point) => (
              <li key={point} className="flex items-center">
                <span className="w-6 h-6 rounded-full bg-secondary-teal/20 flex items-center justify-center mr-3 flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-secondary-teal"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                </span>
                <span className="text-gray-700 dark:text-gray-300">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </motion.div>
  );
};

export default FeatureCard;