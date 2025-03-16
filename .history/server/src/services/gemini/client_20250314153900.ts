import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { handleGeminiError, GeminiApiError } from './error';

export interface SentimentAnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  keyPhrases: string[];
  emotionalTone: string;
}

interface UnvalidatedResponse {
  sentiment?: unknown;
  score?: unknown;
  keyPhrases?: unknown;
  emotionalTone?: unknown;
}

export class GeminiClient {
  private model: GenerativeModel;
  private static instance: GeminiClient;

  private constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  static getInstance(apiKey: string): GeminiClient {
    if (!GeminiClient.instance) {
      GeminiClient.instance = new GeminiClient(apiKey);
    }
    return GeminiClient.instance;
  }

  async analyzeSentiment(text: string): Promise<SentimentAnalysisResult> {
    try {
      const prompt = `Analyze the sentiment of this review. Return a JSON object with the following structure:
      {
        "sentiment": "positive" | "negative" | "neutral",
        "score": <number between 0 and 1>,
        "keyPhrases": [<array of key phrases found in the text>],
        "emotionalTone": <emotional tone like "excited", "satisfied", "frustrated", etc>
      }

      Make sure:
      - sentiment is strictly "positive", "negative", or "neutral"
      - score is a number between 0 and 1
      - keyPhrases contains actual phrases from the text
      - emotionalTone reflects the emotional state expressed in the text

      Review: "${text}"`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();
      
      try {
        const parsed = JSON.parse(content) as UnvalidatedResponse;
        this.validateResponse(parsed);
        return parsed;
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : 'Unknown parsing error';
        throw new Error(`Failed to parse Gemini response: ${error}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw handleGeminiError(error as GeminiApiError);
      }
      throw handleGeminiError({ message: 'Unknown error occurred' });
    }
  }

  async batchAnalyzeSentiment(reviews: string[]): Promise<SentimentAnalysisResult[]> {
    // Process in batches of 5 to avoid rate limits
    const batchSize = 5;
    const results: SentimentAnalysisResult[] = [];
    
    for (let i = 0; i < reviews.length; i += batchSize) {
      const batch = reviews.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(review => this.analyzeSentiment(review))
      );
      results.push(...batchResults);
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < reviews.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  private validateResponse(response: UnvalidatedResponse): asserts response is SentimentAnalysisResult {
    if (typeof response !== 'object' || response === null) {
      throw new Error('Invalid response format');
    }

    if (!['positive', 'negative', 'neutral'].includes(response.sentiment as string)) {
      throw new Error('Invalid sentiment value');
    }

    if (typeof response.score !== 'number' || response.score < 0 || response.score > 1) {
      throw new Error('Invalid score value');
    }

    if (!Array.isArray(response.keyPhrases)) {
      throw new Error('Invalid keyPhrases format');
    }

    if (typeof response.emotionalTone !== 'string' || !response.emotionalTone) {
      throw new Error('Invalid emotionalTone value');
    }
  }
}