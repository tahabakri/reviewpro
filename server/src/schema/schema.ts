import { z } from 'zod';

// Base schema for metadata
const metadataSchema = z.record(z.unknown());

// Business schema
export const businessSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  location: z.string(),
  metadata: metadataSchema,
  created_at: z.string().datetime(),
});

// Competitor schema
export const competitorSchema = z.object({
  id: z.string().uuid(),
  business_id: z.string().uuid(),
  name: z.string(),
  platform: z.string(),
  metadata: metadataSchema,
});

// Review schema
export const reviewSchema = z.object({
  id: z.string().uuid(),
  entity_id: z.string().uuid(),
  rating: z.number().min(0).max(5),
  content: z.string(),
  created_at: z.string().datetime(),
  platform: z.string(),
});

// Sentiment schema
export const sentimentSchema = z.object({
  id: z.string().uuid(),
  review_id: z.string().uuid(),
  score: z.number().min(-1).max(1),
  analysis: z.record(z.unknown()),
  created_at: z.string().datetime(),
});

// Theme schema
export const themeSchema = z.object({
  id: z.string().uuid(),
  review_id: z.string().uuid(),
  category: z.string(),
  sentiment: z.number().min(-1).max(1),
  frequency: z.number().int().min(0),
});

// Alert schema
export const alertSchema = z.object({
  id: z.string().uuid(),
  business_id: z.string().uuid(),
  type: z.enum(['rating_threshold', 'review_volume', 'sentiment_drop', 'data_collection_error']),
  conditions: z.record(z.unknown()),
  active: z.boolean(),
});

// Types derived from schemas
export type Business = z.infer<typeof businessSchema>;
export type Competitor = z.infer<typeof competitorSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type Sentiment = z.infer<typeof sentimentSchema>;
export type Theme = z.infer<typeof themeSchema>;
export type Alert = z.infer<typeof alertSchema>;

// Validation functions
export const validateBusiness = (data: unknown): Business => businessSchema.parse(data);
export const validateCompetitor = (data: unknown): Competitor => competitorSchema.parse(data);
export const validateReview = (data: unknown): Review => reviewSchema.parse(data);
export const validateSentiment = (data: unknown): Sentiment => sentimentSchema.parse(data);
export const validateTheme = (data: unknown): Theme => themeSchema.parse(data);
export const validateAlert = (data: unknown): Alert => alertSchema.parse(data);