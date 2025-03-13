import { useState, ChangeEvent } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

interface Competitor {
  id: string;
  name: string;
  platform: string;
  rating?: number;
  reviews?: number;
}

export default function CompetitiveAnalysis() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [newCompetitor, setNewCompetitor] = useState({
    name: '',
    platform: 'google',
  });

  const handleAddCompetitor = () => {
    if (!newCompetitor.name) return;
    
    setCompetitors([
      ...competitors,
      {
        id: crypto.randomUUID(),
        name: newCompetitor.name,
        platform: newCompetitor.platform,
        rating: Math.random() * 5,
        reviews: Math.floor(Math.random() * 100),
      },
    ]);
    
    setNewCompetitor({ name: '', platform: 'google' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Competitive Analysis Dashboard</h1>
      
      <Card className="mb-8 p-6">
        <h2 className="text-xl font-semibold mb-4">Add Competitor</h2>
        <div className="flex gap-4 mb-4">
          <Input
            type="text"
            placeholder="Competitor name"
            value={newCompetitor.name}
            onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
          />
          <select
            className="rounded-md border border-gray-300 px-4 py-2"
            value={newCompetitor.platform}
            onChange={(e) => setNewCompetitor({ ...newCompetitor, platform: e.target.value })}
          >
            <option value="google">Google</option>
            <option value="yelp">Yelp</option>
            <option value="tripadvisor">TripAdvisor</option>
          </select>
          <Button onClick={handleAddCompetitor}>Add Competitor</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitors.map((competitor) => (
          <Card key={competitor.id} className="p-6">
            <h3 className="text-lg font-semibold mb-2">{competitor.name}</h3>
            <div className="text-sm text-gray-600 mb-4">
              Platform: {competitor.platform}
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Rating</div>
                <div className="text-2xl">{competitor.rating?.toFixed(1)}</div>
              </div>
              <div>
                <div className="font-medium">Reviews</div>
                <div className="text-2xl">{competitor.reviews}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {competitors.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No competitors added yet. Add your first competitor above.
        </div>
      )}
    </div>
  );
}