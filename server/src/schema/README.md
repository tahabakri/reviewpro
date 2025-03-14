# Database Schema Documentation

This directory contains the database schema definitions and initialization scripts for the competitive analysis system.

## Files

- `schema.ts` - TypeScript schema definitions using Zod for runtime type validation
- `tables.sql` - SQL table definitions for Supabase/PostgreSQL
- `init-db.ts` - Database initialization script
- `README.md` - This documentation file

## Schema Overview

The database is structured around these core entities:

- **Businesses**: Main entities being tracked
- **Competitors**: Business competitors across different platforms
- **Reviews**: Customer reviews for businesses and competitors
- **Sentiments**: Sentiment analysis results for reviews
- **Themes**: Extracted themes/topics from reviews
- **Alerts**: Monitoring alerts for businesses

## Setup Instructions

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Configure your environment variables in `.env`:
   - Set your Supabase URL and service key
   - Configure Google API credentials
   - Add Yelp and TripAdvisor API keys
   - (Optional) Add Facebook API credentials

3. Run the database initialization:
   ```bash
   npm run db:init
   ```

Note: You must set up all required environment variables before running the initialization script. See `.env.example` for the complete list of required variables.

## Table Relationships

- Businesses have many Competitors (1:N)
- Businesses and Competitors have many Reviews (1:N)
- Reviews have one Sentiment (1:1)
- Reviews have many Themes (1:N)
- Businesses have many Alerts (1:N)

## Indexes

The schema includes optimized indexes for:
- Full-text search on business names, competitor names, and review content
- Foreign key relationships
- Commonly filtered fields (platform, created_at, type)

## Type Safety

The `schema.ts` file provides Zod schemas that can be used to:
- Validate data at runtime
- Generate TypeScript types
- Ensure consistency between application code and database schema

Usage example:
```typescript
import { validateBusiness } from '../schema/schema';

// Validates data at runtime
const business = validateBusiness(data);