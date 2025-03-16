import React, { useState } from 'react';
import {
  HeroSection,
  TrustBanner,
  FeaturesSection,
  BusinessSearch,
  BusinessAnalytics,
  Newsletter
} from './components';
import { BusinessSearchResult, BusinessDetails } from '../../types/business';

const Home: React.FC = () => {
  // State for business search and analysis
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BusinessSearchResult[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessSearchResult | null>(null);
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for newsletter
  const [email, setEmail] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      setSearchResults([]);
      setSelectedBusiness(null);
      setBusinessDetails(null);

      const response = await fetch(`/api/google-places/search?query=${encodeURIComponent(searchQuery)}`);
      let data;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : null;
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Service response error - please try again');
      }

      if (!response.ok) {
        // Handle specific error types from the API
        if (data?.error && data?.details) {
          throw new Error(data.details);
        }
        throw new Error('Failed to search businesses - please try again');
      }
      
      if (!data || !Array.isArray(data)) {
        console.error('Invalid response format:', data);
        throw new Error('Unexpected response format from server');
      }

      if (data.length === 0) {
        setError('No businesses found - try different search terms');
        return;
      }

      setSearchResults(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Search error:', { error: err, query: searchQuery });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBusiness = async (business: BusinessSearchResult) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedBusiness(business);
      setBusinessDetails(null);

      const response = await fetch(`/api/google-places/details/${business.placeId}`);
      let data;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : null;
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Service response error - please try again');
      }

      if (!response.ok) {
        // Handle specific error types from the API
        if (data?.error && data?.details) {
          throw new Error(data.details);
        }
        throw new Error('Failed to get business details - please try again');
      }
      
      if (!data || typeof data !== 'object') {
        console.error('Invalid response format:', data);
        throw new Error('Unexpected response format from server');
      }

      setBusinessDetails(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Details error:', { error: err, businessId: business.placeId });
      setSelectedBusiness(null);
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
      <HeroSection />
      <TrustBanner />
      <FeaturesSection />

      {/* Business Review Analysis Section */}
      <section className="section-container">
        <h2 className="heading-xl mb-4 text-center">
          Analyze Your <span className="text-gradient">Business Reviews</span>
        </h2>
        <p className="text-xl text-body section-content mb-12">
          Get insights into your customer reviews and improve your online reputation.
        </p>

        <BusinessSearch
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearch={handleSearch}
          onSelectBusiness={handleSelectBusiness}
          loading={loading}
          error={error}
          searchResults={searchResults}
        />

        {businessDetails && <BusinessAnalytics details={businessDetails} />}
      </section>

      <Newsletter
        email={email}
        onEmailChange={setEmail}
        onSubmit={handleNewsletterSubmit}
      />
    </div>
  );
};

export default Home;
