# 5-Hour Implementation Plan: Google Gemini Sentiment Analysis

## Overview

A focused implementation of Google Gemini AI-powered sentiment analysis for Google Maps reviews, optimized for quick deployment while maintaining scalability.

## Timeline Breakdown

```mermaid
gantt
    title 5-Hour Implementation Schedule
    dateFormat HH:mm
    axisFormat %H:%M
    
    section Backend
    Gemini Integration    :13:00, 45m
    Sentiment Analysis    :13:45, 45m
    
    section API Layer
    Endpoints Setup      :14:30, 45m
    Caching Layer       :15:15, 45m
    
    section Frontend
    Dashboard Updates    :16:00, 45m
    Testing & Deploy    :16:45, 45m
```

## 1. Gemini Integration (45min)

### Setup
```typescript
// src/services/gemini/client.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiClient {
  private model: any;
  
  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async analyzeSentiment(text: string) {
    const prompt = `Analyze the sentiment of this review. Return JSON:
      {
        "sentiment": "positive|negative|neutral",
        "score": 0.0-1.0,
        "keyPhrases": ["phrase1", "phrase2"],
        "emotionalTone": "excited|satisfied|frustrated|etc"
      }
      
      Review: "${text}"`;

    const result = await this.model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }
}
```

### Error Handling
```typescript
// src/services/gemini/error.ts
export class GeminiError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean
  ) {
    super(message);
  }
}

export const handleGeminiError = (error: any) => {
  // Handle rate limits, invalid requests, etc.
}
```

## 2. Sentiment Analysis Service (45min)

### Core Service
```typescript
// src/services/sentiment/analyzer.ts
interface SentimentResult {
  reviewId: string;
  sentiment: string;
  score: number;
  keyPhrases: string[];
  emotionalTone: string;
  timestamp: Date;
}

export class SentimentAnalyzer {
  constructor(private gemini: GeminiClient) {}

  async analyzeReview(reviewId: string, text: string): Promise<SentimentResult> {
    const analysis = await this.gemini.analyzeSentiment(text);
    return {
      reviewId,
      ...analysis,
      timestamp: new Date()
    };
  }

  async batchAnalyze(reviews: Array<{id: string, text: string}>) {
    // Process in batches of 5 to avoid rate limits
    return this.processBatch(reviews, 5);
  }
}
```

### Database Updates
```sql
-- migrations/001_sentiment_tables.sql
CREATE TABLE sentiment_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES reviews(id),
  sentiment TEXT NOT NULL,
  score FLOAT NOT NULL,
  key_phrases TEXT[] NOT NULL,
  emotional_tone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sentiment_review ON sentiment_analysis(review_id);
CREATE INDEX idx_sentiment_score ON sentiment_analysis(score);
```

## 3. API Layer (45min)

### Endpoints
```typescript
// src/routes/sentiment.ts
router.get('/api/reviews/:id/sentiment', async (req, res) => {
  const { id } = req.params;
  const analysis = await sentimentService.getAnalysis(id);
  res.json(analysis);
});

router.get('/api/places/:id/sentiment', async (req, res) => {
  const { id } = req.params;
  const { timeRange } = req.query;
  const analysis = await sentimentService.getPlaceAnalysis(id, timeRange);
  res.json(analysis);
});
```

### Response Types
```typescript
// src/types/sentiment.ts
export interface SentimentResponse {
  overall: {
    positive: number;
    negative: number;
    neutral: number;
    averageScore: number;
  };
  topPhrases: Array<{
    text: string;
    frequency: number;
    sentiment: string;
  }>;
  recentTrend: Array<{
    date: string;
    score: number;
    volume: number;
  }>;
}
```

## 4. Caching Layer (45min)

### Redis Setup
```typescript
// src/services/cache/redis.ts
import { Redis } from 'ioredis';

export class CacheService {
  constructor(private redis: Redis) {}

  private getKey(type: string, id: string) {
    return `sentiment:${type}:${id}`;
  }

  async cacheSentiment(reviewId: string, data: SentimentResult) {
    const key = this.getKey('review', reviewId);
    await this.redis.setex(key, 3600, JSON.stringify(data));
  }

  async getCachedSentiment(reviewId: string) {
    const key = this.getKey('review', reviewId);
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }
}
```

## 5. Frontend Updates (45min)

### Dashboard Component
```typescript
// src/components/SentimentDashboard.tsx
export const SentimentDashboard: React.FC<Props> = ({ placeId }) => {
  const [sentimentData, setSentimentData] = useState<SentimentResponse | null>(null);
  
  // Fetch data
  useEffect(() => {
    fetchSentimentData(placeId);
  }, [placeId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SentimentOverview data={sentimentData?.overall} />
      <TopPhrasesChart phrases={sentimentData?.topPhrases} />
      <SentimentTrend data={sentimentData?.recentTrend} />
    </div>
  );
};
```

### Charts
```typescript
// src/components/charts/SentimentChart.tsx
export const SentimentTrend: React.FC<Props> = ({ data }) => {
  return (
    <Card>
      <ResponsiveLine
        data={[
          {
            id: 'sentiment',
            data: data?.map(d => ({
              x: d.date,
              y: d.score
            })) ?? []
          }
        ]}
        margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
        axisBottom={{
          format: '%b %d',
          tickRotation: -45
        }}
        enablePoints={false}
        curve="monotoneX"
      />
    </Card>
  );
};
```

## 6. Testing & Deployment (45min)

### Unit Tests
```typescript
// src/services/__tests__/sentiment.test.ts
describe('SentimentAnalyzer', () => {
  it('should analyze review sentiment', async () => {
    const analyzer = new SentimentAnalyzer(mockGemini);
    const result = await analyzer.analyzeReview('123', 'Great service!');
    expect(result.sentiment).toBe('positive');
  });
});
```

### Environment Setup
```env
# .env
GEMINI_API_KEY=your-api-key
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
```

## Quick Start

1. Install dependencies:
```bash
npm install @google/generative-ai ioredis @supabase/supabase-js
```

2. Set up environment variables:
```bash
cp .env.example .env
# Add your API keys
```

3. Run migrations:
```bash
npm run migrate
```

4. Start the server:
```bash
npm run dev
```

## API Documentation

### GET /api/reviews/:id/sentiment
Get sentiment analysis for a specific review

### GET /api/places/:id/sentiment
Get aggregated sentiment analysis for a business location

### POST /api/sentiment/analyze
Trigger sentiment analysis for new reviews

## Monitoring

- Monitor Gemini API usage and costs
- Track sentiment analysis processing time
- Watch for rate limit errors
- Monitor cache hit/miss rates

## Next Steps

1. Implement more advanced topic clustering
2. Add image sentiment analysis with Gemini Pro Vision
3. Create automated insight generation
4. Build custom report generation
5. Add competitor sentiment comparison