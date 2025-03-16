import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from './ui/Card';
import { Tabs } from './ui/Tabs';
import { SentimentDashboard } from './sentiment';

interface Props {
  placeId: string;
}

export const CompetitiveAnalysisDashboard: React.FC<Props> = ({ placeId }) => {
  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = [
    { name: 'Overview', id: 'overview' },
    { name: 'Sentiment Analysis', id: 'sentiment' },
    { name: 'Competitor Comparison', id: 'competitors' }
  ];

  return (
    <div className="space-y-6">
      <Tabs
        tabs={tabs}
        selectedIndex={selectedTab}
        onChange={setSelectedTab}
      >
        {/* Overview Panel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-semibold mb-2">Overall Rating</h3>
            <div className="text-4xl font-bold text-primary-indigo">4.5</div>
          </Card>

          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-semibold mb-2">Review Count</h3>
            <div className="text-4xl font-bold text-primary-indigo">1,234</div>
          </Card>

          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-semibold mb-2">Market Position</h3>
            <div className="text-4xl font-bold text-primary-indigo">#2</div>
          </Card>
        </motion.div>

        {/* Sentiment Analysis Panel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <SentimentDashboard placeId={placeId} />
        </motion.div>

        {/* Competitor Comparison Panel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-semibold mb-4">Competitor Rankings</h3>
            <div className="space-y-4">
              {[
                { name: 'Restaurant A', rating: 4.8 },
                { name: 'Your Business', rating: 4.5 },
                { name: 'Restaurant B', rating: 4.3 },
                { name: 'Restaurant C', rating: 4.1 }
              ].map((competitor, index) => (
                <div
                  key={competitor.name}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    competitor.name === 'Your Business'
                      ? 'bg-primary-indigo/10 border border-primary-indigo/30'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-gray-500">
                      #{index + 1}
                    </span>
                    <span className="font-medium">
                      {competitor.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      {competitor.rating}
                    </span>
                    <span className="text-yellow-400">★</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </Tabs>
    </div>
  );
};