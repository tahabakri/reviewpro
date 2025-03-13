import { useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';

interface Props {
  onAdd: (name: string, platform: string) => Promise<void>;
  onClose: () => void;
  isOpen: boolean;
}

export default function AddCompetitorModal({ onAdd, onClose, isOpen }: Props) {
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('google');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      setIsLoading(true);
      setError(null);
      await onAdd(name, platform);
      setName('');
      setPlatform('google');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add competitor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Competitor</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              label="Competitor Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Platform
            </label>
            <select
              id="platform-select"
              aria-label="Select platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
            >
              <option value="google">Google Places</option>
              <option value="yelp">Yelp</option>
              <option value="tripadvisor">TripAdvisor</option>
              <option value="facebook">Facebook</option>
            </select>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          
          <div className="flex justify-end space-x-3">
            <Button
              onClick={onClose}
              type="button"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name}
              className={isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {isLoading ? 'Adding...' : 'Add Competitor'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}