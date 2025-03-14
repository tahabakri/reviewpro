import { LanguageServiceClient } from '@google-cloud/language';
import { protos } from '@google-cloud/language';

export const createMockLanguageClient = () => {
  const baseMock = {
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
    // Add minimal required LanguageServiceClient properties
    _terminated: false,
    _opts: {},
    _providedCustomServicePath: false,
    _gaxModule: null,
    close: jest.fn().mockResolvedValue(undefined),
    getProjectId: jest.fn().mockResolvedValue('test-project'),
    location: jest.fn().mockReturnValue('test-location'),
    auth: {
      getClient: jest.fn().mockResolvedValue({}),
      getProjectId: jest.fn().mockResolvedValue('test-project'),
    },
  };

  return baseMock as unknown as LanguageServiceClient;
};

export type MockLanguageResponse = {
  analyzeSentiment: protos.google.cloud.language.v1.IAnalyzeSentimentResponse;
  classifyText: protos.google.cloud.language.v1.IClassifyTextResponse;
};

export const defaultMockResponse: MockLanguageResponse = {
  analyzeSentiment: {
    documentSentiment: {
      score: 0.8,
      magnitude: 0.9,
    },
    sentences: [{
      text: { content: 'Great service and food!' },
      sentiment: { score: 0.8, magnitude: 0.9 },
    }],
  },
  classifyText: {
    categories: [
      { name: 'Food', confidence: 0.9 },
      { name: 'Service', confidence: 0.8 },
    ],
  },
};