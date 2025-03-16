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
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data?.details || 'Failed to search businesses');
      }
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid response format from server');
      }

      setSearchResults(data);
    } catch (err) {
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to search businesses. Please try again.'
      );
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
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.details || 'Failed to search businesses');
      }
      
      setSearchResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search businesses. Please try again.');
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
      let data;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : null;
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data?.details || 'Failed to get business details');
      }
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from server');
      }

      setBusinessDetails(data);
    } catch (err) {
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to get business details. Please try again.'
      );
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
