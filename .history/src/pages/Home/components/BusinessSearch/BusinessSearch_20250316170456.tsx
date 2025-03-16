import React from 'react';
import { motion } from 'framer-motion';
import Input from '../../../../components/ui/Input';
import Button from '../../../../components/ui/Button';
import Card from '../../../../components/ui/Card';
import { staggerContainer, slideUp } from '../../../../utils/animations';
import { BusinessSearchResult } from '../../../../types/business';

interface BusinessSearchProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  onSelectBusiness: (business: BusinessSearchResult) => void;
  loading: boolean;
  error: string | null;
  searchResults: BusinessSearchResult[];
}

const BusinessSearch: React.FC<BusinessSearchProps> = ({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  onSelectBusiness,
  loading,
  error,
  searchResults,
}) => {
  return (
    <>
      {/* Search Input */}
      <motion.div
        className="max-w-md mx-auto mb-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={slideUp}
      >
        <Input
          label="Enter Business Name or Location"
          type="text"
          placeholder="e.g., Joe's Coffee Shop New York"
          className="mb-4"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
        />
        <Button
          onClick={onSearch}
          disabled={loading || !searchQuery.trim()}
          className="w-full"
        >
          {loading ? 'Searching...' : 'Search Business'}
        </Button>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          className="max-w-md mx-auto mb-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">
              <span className="font-semibold">Error: </span>
              {error}
            </p>
            <p className="text-red-500 dark:text-red-300 text-sm mt-1">
              {error.toLowerCase().includes('api key') ? (
                'API configuration issue. Please contact support.'
              ) : error.toLowerCase().includes('no results') ? (
                'Try different search terms or location'
              ) : error.toLowerCase().includes('over_query_limit') ? (
                'Service is temporarily busy. Please try again in a few minutes.'
              ) : error.toLowerCase().includes('invalid') ? (
                'Please check your search input and try again'
              ) : (
                'An error occurred. Please try again.'
              )}
            </p>
          </div>
        </motion.div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <motion.div
          className="max-w-2xl mx-auto mb-8"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <h3 className="heading-md text-center">Search Results</h3>
          <div className="stack-y-4">
            {searchResults.map((business) => (
              <motion.div
                key={business.placeId}
                variants={slideUp}
                className="cursor-pointer hover-lift"
                onClick={() => onSelectBusiness(business)}
              >
                <Card variant="glass" className="p-4">
                  <h4 className="heading-md mb-1">{business.name}</h4>
                  <p className="text-body">{business.location}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-primary-indigo font-bold">{business.rating}</span>
                    <span className="text-dim ml-1">
                      ({business.reviewCount} reviews)
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </>
  );
};

export default BusinessSearch;
