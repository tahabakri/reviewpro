import axios from 'axios';
import { RateLimiter } from 'limiter';

interface GeminiConfig {
  apiKey: string;
  maxRetries: number;
  retryDelay: number;
}

export class GeminiClient {
  private limiter: RateLimiter;
  private config: GeminiConfig;

  constructor(config: GeminiConfig) {
    this.config = config;
    this.limiter = new RateLimiter({
      tokensPerInterval: 60,
      interval: 'minute'
    });
  }

  async analyzeSentiment(text: string): Promise<{
    score: number;
    keyPhrases: string[];
  }> {
    await this.limiter.removeTokens(1);

    const prompt = `
      Analyze the sentiment of the following text and extract key phrases.
      Respond in JSON format with 'score' (-1 to 1) and 'keyPhrases' array.
      Text: "${text}"
    `;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const response = await axios.post(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
          {
            contents: [{ parts: [{ text: prompt }] }]
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': this.config.apiKey
            }
          }
        );

        const result = response.data.candidates[0].content.parts[0].text;
        const parsed = JSON.parse(result);

        if (
          typeof parsed.score === 'number' &&
          Array.isArray(parsed.keyPhrases) &&
          parsed.keyPhrases.every((p: any) => typeof p === 'string')
        ) {
          return parsed;
        }

        throw new Error('Invalid response format');
      } catch (error) {
        if (attempt === this.config.maxRetries) {
          throw error;
        }
        await new Promise(resolve =>
          setTimeout(resolve, this.config.retryDelay * attempt)
        );
      }
    }

    throw new Error('Max retries exceeded');
  }
}