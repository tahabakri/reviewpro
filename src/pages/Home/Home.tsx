import React, { useState } from 'react';
import {
  HeroSection,
  TrustBanner,
  FeaturesSection,
  BusinessSearch,
  BusinessAnalytics,
  Newsletter
} from './components';

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
      setSelectedBusiness(business);
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
      <HeroSection />
      <TrustBanner />
      <FeaturesSection />

      {/* Business Review Analysis Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold font-heading mb-4 text-center">
          Analyze Your <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary-indigo to-primary-purple">Business Reviews</span>
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-center mb-12">
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