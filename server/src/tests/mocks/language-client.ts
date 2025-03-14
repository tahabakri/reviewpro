import { protos } from '@google-cloud/language';

export const mockSentimentResponse = {
  documentSentiment: {
    score: 0.8,
    magnitude: 0.9,
  },
  sentences: [
    {
      text: { content: 'Great service and amazing food!' },
      sentiment: { score: 0.8, magnitude: 0.9 },
    },
  ],
} as protos.google.cloud.language.v1.IAnalyzeSentimentResponse;

export const mockClassifyResponse = {
  categories: [
    {
      name: 'Food & Drink/Restaurants',
      confidence: 0.9,
    },
    {
      name: 'Service',
      confidence: 0.8,
    },
  ],
} as protos.google.cloud.language.v1.IClassifyTextResponse;

export const mockLanguageClient = {
  analyzeSentiment: jest.fn().mockResolvedValue([mockSentimentResponse]),
  classifyText: jest.fn().mockResolvedValue([mockClassifyResponse]),
};

export const createMockLanguageClient = () => ({
  ...mockLanguageClient,
  analyzeSentiment: jest.fn().mockResolvedValue([mockSentimentResponse]),
  classifyText: jest.fn().mockResolvedValue([mockClassifyResponse]),
});