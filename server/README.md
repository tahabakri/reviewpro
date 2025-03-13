# Competitive Analysis System - Server

This is the backend server for the competitive analysis system, which provides APIs for collecting, analyzing, and managing competitor data from various platforms.

## Features

- **Data Collection**: Automated collection of competitor data from multiple platforms
  - Google Places
  - Yelp
  - TripAdvisor
  - (Optional) Facebook
- **Sentiment Analysis**: AI-powered analysis of review content
- **Theme Extraction**: Identification of common themes and topics in reviews
- **Real-time Alerts**: Configurable alerts for important changes
- **Performance Analytics**: Comprehensive competitor performance tracking

## Tech Stack

- Node.js + Express
- TypeScript
- Supabase (PostgreSQL)
- Redis + Bull (Job Queue)
- Google Cloud Language API

## Prerequisites

- Node.js >= 18
- Redis Server
- Supabase Account
- Google Cloud Project with enabled APIs:
  - Places API
  - Cloud Natural Language API
- Yelp Developer Account
- TripAdvisor API Key

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your credentials:
   - Supabase URL and service key
   - Google Cloud API credentials
   - Yelp API key
   - TripAdvisor API key
   - (Optional) Facebook App credentials

4. Initialize the database:
   ```bash
   # Using Supabase CLI
   supabase init
   supabase db push
   ```

5. Build the project:
   ```bash
   npm run build
   ```

## Development

Start the development server with:
```bash
npm run dev
```

This will start the server in development mode with hot reloading.

## API Routes

### Competitors

- `GET /api/competitors/:businessId` - Get all competitors for a business
- `POST /api/competitors/search` - Search for new competitors
- `POST /api/competitors` - Add a new competitor
- `DELETE /api/competitors/:id` - Remove a competitor

### Reviews

- `GET /api/reviews/competitor/:competitorId` - Get reviews for a competitor
- `GET /api/reviews/sentiment/:competitorId` - Get sentiment analysis for reviews
- `GET /api/reviews/themes/:competitorId` - Get common themes from reviews

### Alerts

- `GET /api/alerts/:businessId` - Get alerts for a business
- `POST /api/alerts` - Create a new alert
- `PATCH /api/alerts/:id/status` - Update alert status
- `DELETE /api/alerts/:id` - Delete an alert

### Insights

- `GET /api/insights/performance/:businessId` - Get competitor performance metrics
- `GET /api/insights/trends/:businessId` - Get trend analysis

## Background Jobs

The system uses Bull for managing background jobs:

- Data Collection: Runs every 6 hours to fetch new data
- ETL Pipeline: Processes and standardizes collected data
- Sentiment Analysis: Analyzes review content
- Notifications: Handles alert delivery

## Testing

Run the test suite with:
```bash
npm test
```

## Production Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

Consider using a process manager like PM2 in production:
```bash
pm2 start dist/index.js --name "competitive-analysis-server"
```

## Monitoring

The server includes built-in monitoring endpoints:

- `/health` - Basic health check
- `/metrics` - Prometheus metrics (requires configuration)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT