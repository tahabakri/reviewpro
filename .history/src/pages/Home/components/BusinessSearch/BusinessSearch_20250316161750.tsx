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
      {searchResults.length > 0 && (
        <motion.div
          className="max-w-2xl mx-auto mb-8"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <h3 className="text-xl font-bold mb-4 text-center">Search Results</h3>
          <div className="space-y-4">
            {searchResults.map((business) => (
              <motion.div
                key={business.placeId}
                variants={slideUp}
                className="cursor-pointer"
                onClick={() => onSelectBusiness(business)}
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
    </>
  );
};

export default BusinessSearch;
