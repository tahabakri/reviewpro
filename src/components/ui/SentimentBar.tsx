import React from 'react';

interface SentimentBarProps {
  label: string;
  value: number;
  color: string;
}

const SentimentBar: React.FC<SentimentBarProps> = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span>{label}</span>
      <span>{(value * 100).toFixed(1)}%</span>
    </div>
    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
      <div
        className={`h-full ${color} rounded-full`}
        style={{ width: `${value * 100}%` }}
      />
    </div>
  </div>
);

export default SentimentBar;
