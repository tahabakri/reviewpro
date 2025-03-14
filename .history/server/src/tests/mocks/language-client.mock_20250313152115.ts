import { protos } from '@google-cloud/language';

export interface MockLanguageClient {
  analyzeSentiment(request: {
    document: {
      content: string;
      type: string;
    };
  }): Promise<[protos.google.cloud.language.v1.IAnalyzeSentimentResponse]>;
  
  classifyText(request: {
    document: {
      content: string;
      type: string;
    };
  }): Promise<[protos.google.cloud.language.v1.IClassifyTextResponse]>;
}

export const createMockLanguageClient = () => ({
  analyzeSentiment: jest.fn().mockResolvedValue([{
    documentSentiment: {
      score: 0.8,
      magnitude: 0.9,
    },
    sentences: [{
      text: { content: 'Great service and food!' },
      sentiment: { score: 0.8, magnitude: 0.9 },
    }],
  }]),
  classifyText: jest.fn().mockResolvedValue([{
    categories: [
      { name: 'Food', confidence: 0.9 },
      { name: 'Service', confidence: 0.8 },
    ],
  }]),
});