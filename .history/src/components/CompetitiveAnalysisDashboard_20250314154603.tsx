import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from './ui/Card';
import { SentimentDashboard } from './sentiment';
import { Tab } from '@headlessui/react';

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
      <div className="border-b border-gray-200">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-8">
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                className={({ selected }) =>
                  `py-4 px-1 text-sm font-medium border-b-2 focus:outline-none ${
                    selected
                      ? 'border-primary-indigo text-primary-indigo'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`
                }
              >
                {tab.name}
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels className="mt-4">
            {/* Overview Panel */}
            <Tab.Panel>
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
            </Tab.Panel>

            {/* Sentiment Analysis Panel */}
            <Tab.Panel>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <SentimentDashboard placeId={placeId} />
              </motion.div>
            </Tab.Panel>

            {/* Competitor Comparison Panel */}
            <Tab.Panel>
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
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};