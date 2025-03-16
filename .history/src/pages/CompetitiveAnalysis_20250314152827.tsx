import React from 'react';
import { CompetitiveAnalysisDashboard } from '../components/CompetitiveAnalysisDashboard';

export const CompetitiveAnalysis: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Competitive Analysis</h1>
      
      <div className="grid grid-cols-1 gap-8">
        {/* Example business - replace with real data */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">Business Analysis</h2>
            <p className="text-gray-600 mt-1">Google Places Reviews and Insights</p>
          </div>
          
          <div className="p-6">
            <CompetitiveAnalysisDashboard placeId="example-place-id" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to Use</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              1. Enter a business Place ID in the dashboard component to analyze its reviews
            </p>
            <p>
              2. View the average rating, total review count, and sentiment distribution
            </p>
            <p>
              3. Use the interactive chart to explore sentiment trends over time
            </p>
            <p>
              4. Export or share analysis results for team collaboration
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitiveAnalysis;