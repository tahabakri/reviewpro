import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().optional(),
  VITE_GOOGLE_PLACES_API_KEY: z.string().optional(),
  VITE_GOOGLE_AI_API_KEY: z.string().optional(),
  VITE_PUSH_PUBLIC_KEY: z.string().optional(),
  VITE_MAX_REQUESTS_PER_MINUTE: z.coerce.number().default(60),
  VITE_ENABLE_COMPETITOR_TRACKING: z.coerce.boolean().default(true),
  VITE_ENABLE_AI_RESPONSES: z.coerce.boolean().default(true),
  VITE_ENABLE_ANALYTICS: z.coerce.boolean().default(true),
  VITE_SUPPORT_EMAIL: z.string().email().default('support@reviewmanagement.com'),
  VITE_DEBUG_ENABLED: z.coerce.boolean().default(false),
});

export const env = envSchema.parse(import.meta.env);

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;