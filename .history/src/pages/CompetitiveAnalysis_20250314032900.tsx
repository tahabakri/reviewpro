import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AddCompetitorModal from '../components/AddCompetitorModal';
import { BusinessService, CompetitorService, ReviewService } from '../lib/services/api';
import type { Database } from '../lib/database.types';

type Business = Database['public']['Tables']['businesses']['Row'];
type Competitor = Database['public']['Tables']['competitors']['Row'];
type Review = Database['public']['Tables']['reviews']['Row'];

interface CompetitorWithReviews extends Competitor {
  reviews: Review[];
}

// Mock data to use as fallback when API fails
const mockBusiness: Business = {
  id: 'mock-123',
  name: 'Sample Business',
  description: 'This is a sample business for demo purposes',
  location: 'San Francisco, CA',
  created_at: new Date().toISOString(),
  metadata: {}
};

const mockCompetitors: CompetitorWithReviews[] = [
  {
    id: 'comp-1',
    business_id: 'mock-123',
    name: 'Competitor A',
    platform: 'Google',
    created_at: new Date().toISOString(),
    metadata: {},
    reviews: [
      {
        id: 'rev-1',
        entity_id: 'comp-1',
        entity_type: 'competitor',
        author: 'John Doe',
        content: 'Great product and service!',
        rating: 4.5,
        created_at: new Date().toISOString(),
        platform: 'Google',
        metadata: {}
      }
    ]
  },
  {
    id: 'comp-2',
    business_id: 'mock-123',
    name: 'Competitor B',
    platform: 'Yelp',
    created_at: new Date().toISOString(),
    metadata: {},
    reviews: [
      {
        id: 'rev-2',
        entity_id: 'comp-2',
        entity_type: 'competitor',
        author: 'Jane Smith',
        content: 'Decent service but could improve.',
        rating: 3.5,
        created_at: new Date().toISOString(),
        platform: 'Yelp',
        metadata: {}
      }
    ]
  }
];

export default function CompetitiveAnalysis() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [competitors, setCompetitors] = useState<CompetitorWithReviews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    loadBusinessData();
  }, []);

  async function loadBusinessData() {
    try {
      setLoading(true);
      // In a real app, we'd get the business ID from auth context
      const mockBusinessId = '123';
      
      try {
        // Try to get data from the API first
        const businessData = await BusinessService.getById(mockBusinessId);
        setBusiness(businessData);
        
        const competitorsData = await CompetitorService.getByBusinessId(mockBusinessId);
        
        // Load reviews for each competitor
        const competitorsWithReviews = await Promise.all(
          competitorsData.map(async (competitor) => {
            const reviews = await ReviewService.getByEntityId(competitor.id);
            return { ...competitor, reviews };
          })
        );
        
        setCompetitors(competitorsWithReviews);
      } catch (apiErr) {
        console.error('API error:', apiErr);
        // Fall back to mock data if API fails
        setUseMockData(true);
        setBusiness(mockBusiness);
        setCompetitors(mockCompetitors);
      }
    } catch (err) {
      console.error('Error in component:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  const addCompetitor = async (name: string, platform: string) => {
    if (!business) return;
    
    try {
      if (useMockData) {
        // Use mock data for adding competitors when in mock mode
        const newId = `comp-${competitors.length + 1}`;
        const newCompetitor: CompetitorWithReviews = {
          id: newId,
          business_id: business.id,
          name,
          platform,
          created_at: new Date().toISOString(),
          metadata: {},
          reviews: []
        };
        setCompetitors([...competitors, newCompetitor]);
      } else {
        // Use real API
        const newCompetitor = await CompetitorService.create({
          business_id: business.id,
          name,
          platform,
          metadata: {}
        });
        
        setCompetitors([...competitors, { ...newCompetitor, reviews: [] }]);
      }
    } catch (err) {
      console.error('Error adding competitor:', err);
      setError(err instanceof Error ? err.message : 'Failed to add competitor');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-purple"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Mock data warning */}
      {useMockData && (
        <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded">
          Note: Using demo data because API connection failed.
        </div>
      )}
      
      {/* Overview Panel */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Competitive Analysis Dashboard</h1>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Business Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-gray-500">Business Name</h3>
              <p className="text-xl">{business?.name || 'N/A'}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-500">Location</h3>
              <p className="text-xl">{business?.location || 'N/A'}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-500">Competitors</h3>
              <p className="text-xl">{competitors.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Competitor Analysis */}
      <div className="mb-8">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Competitor Analysis</h2>
            <Button onClick={() => setIsAddModalOpen(true)}>
              Add Competitor
            </Button>
          </div>

          <AddCompetitorModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onAdd={addCompetitor}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitors.map((competitor) => (
              <Card key={competitor.id} className="p-4">
                <h3 className="text-lg font-semibold mb-2">{competitor.name}</h3>
                <div className="text-sm text-gray-600 mb-4">
                  Platform: {competitor.platform}
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Average Rating</div>
                    <div className="text-2xl">
                      {competitor.reviews.length > 0
                        ? (
                            competitor.reviews.reduce((acc, rev) => acc + rev.rating, 0) /
                            competitor.reviews.length
                          ).toFixed(1)
                        : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Reviews</div>
                    <div className="text-2xl">{competitor.reviews.length}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>

      {/* Insights Panel */}
      <div className="mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="font-medium mb-2">Rating Trends</h3>
              <p className="text-gray-600">
                Rating trends visualization will be displayed here
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="font-medium mb-2">Review Sentiment</h3>
              <p className="text-gray-600">
                Sentiment analysis results will be displayed here
              </p>
            </Card>
          </div>
        </Card>
      </div>

      {/* Alerts Center */}
      <div>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Alerts Center</h2>
          <div className="space-y-4">
            <Card className="p-4 border-l-4 border-yellow-500">
              <h3 className="font-medium mb-1">Rating Alert</h3>
              <p className="text-gray-600">
                Competitor A's rating has dropped below threshold
              </p>
            </Card>
            <Card className="p-4 border-l-4 border-blue-500">
              <h3 className="font-medium mb-1">Review Alert</h3>
              <p className="text-gray-600">
                New negative review detected for Competitor B
              </p>
            </Card>
          </div>
        </Card>
      </div>
    </div>
  );
}