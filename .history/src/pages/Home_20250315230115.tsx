import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

interface BusinessSearchResult {
  name: string;
  rating: number;
  reviewCount: number;
  location: string;
  placeId: string;
}

interface BusinessDetails {
  overallRating: number;
  reviewCount: number;
  sentimentAnalysis: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

const Home: React.FC = () => {
  const [email, setEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BusinessSearchResult[]>([]);
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      setSearchResults([]);
      setBusinessDetails(null);

      const response = await fetch(`/api/google-places/search?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Failed to search businesses');
      
      const results = await response.json();
      setSearchResults(results);
    } catch (err) {
      setError('Failed to search businesses. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBusiness = async (business: BusinessSearchResult) => {
    try {
      setLoading(true);
      setError(null);
      setBusinessDetails(null);

      const response = await fetch(`/api/google-places/details/${business.placeId}`);
      if (!response.ok) throw new Error('Failed to get business details');
      
      const details = await response.json();
      setBusinessDetails(details);
    } catch (err) {
      setError('Failed to get business details. Please try again.');
      console.error('Details error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter signup
    console.log('Newsletter signup:', email);
  };

  return (
    <div className="flex-1">
      {/* Business Review Analysis Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div 
          className="text-center mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold font-heading mb-4">
            Analyze Your <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary-indigo to-primary-purple">Business Reviews</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Enter your business name to get insights into your customer reviews.
          </p>
        </motion.div>

        {/* Search Input */}
        <motion.div
          className="max-w-md mx-auto mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Input
            label="Enter Business Name or Location"
            type="text"
            placeholder="e.g., Joe's Coffee Shop New York"
            className="mb-4"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button 
            onClick={handleSearch}
            disabled={loading || !searchQuery.trim()}
          >
            {loading ? 'Searching...' : 'Search Business'}
          </Button>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="max-w-md mx-auto mb-8 text-red-500 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && !businessDetails && (
          <motion.div className="max-w-2xl mx-auto mb-8">
            <h3 className="text-xl font-bold mb-4 text-center">Search Results</h3>
            <div className="space-y-4">
              {searchResults.map((business) => (
                <motion.div
                  key={business.placeId}
                  className="cursor-pointer"
                  onClick={() => handleSelectBusiness(business)}
                >
                  <Card variant="glass" className="p-4 hover:shadow-xl transition-all duration-300">
                    <h4 className="text-lg font-bold">{business.name}</h4>
                    <p className="text-gray-600 dark:text-gray-300">{business.location}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-primary-indigo font-bold">{business.rating}</span>
                      <span className="text-gray-600 dark:text-gray-300 ml-1">
                        ({business.reviewCount} reviews)
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Business Details */}
        {businessDetails && (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div>
              <Card variant="glass" className="p-8 h-full">
                <h3 className="text-2xl font-bold font-heading mb-4">Overall Rating</h3>
                <div className="text-5xl font-bold text-primary-indigo">
                  {businessDetails.overallRating.toFixed(1)}
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  Based on {businessDetails.reviewCount} reviews
                </div>
              </Card>
            </motion.div>

            <motion.div>
              <Card variant="glass" className="p-8 h-full">
                <h3 className="text-2xl font-bold font-heading mb-4">Sentiment Analysis</h3>
                <div className="space-y-4">
                  {Object.entries(businessDetails.sentimentAnalysis).map(([sentiment, value]) => (
                    <div key={sentiment}>
                      <div className="flex justify-between mb-1">
                        <span className="capitalize">{sentiment}</span>
                        <span>{(value * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-full ${
                            sentiment === 'positive'
                              ? 'bg-green-500'
                              : sentiment === 'neutral'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          } rounded-full`}
                          style={{ width: `${value * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && !searchResults.length && !businessDetails && (
          <motion.div className="text-center">
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Enter a business name to analyze reviews
            </p>
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default Home;