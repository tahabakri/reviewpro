# Project Bolt: Real-Time Sentiment Analysis System

A real-time sentiment analysis system powered by Google's Gemini AI, providing instant insights into customer reviews and feedback.

## Features

- 🤖 **AI-Powered Sentiment Analysis**
  - Advanced sentiment detection using Gemini AI
  - Key phrase extraction
  - Emotional tone analysis
  - Multi-language support

- ⚡ **Real-Time Processing**
  - Live review monitoring
  - WebSocket-based updates
  - Instant sentiment scoring
  - Trend detection

- 🔔 **Smart Alerts**
  - Sentiment drop detection
  - Negative review spike alerts
  - Volume change notifications
  - Custom alert thresholds

- 📊 **Analytics Dashboard**
  - Real-time sentiment overview
  - Historical trend analysis
  - Distribution charts
  - Key phrase cloud

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Redis
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/project-bolt.git
cd project-bolt
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm run dev
```

### Environment Variables

See `.env.example` for all required environment variables and their descriptions.

## Architecture

### Backend Services

- **Sentiment Analysis**
  - Gemini AI integration
  - Caching layer
  - Batch processing

- **Real-Time Updates**
  - WebSocket server
  - Change detection
  - Connection management

- **Alert System**
  - Threshold monitoring
  - Email notifications
  - Webhook integration

### Frontend Components

- **Dashboard**
  - Live sentiment display
  - Interactive charts
  - Review feed

- **Alert Management**
  - Threshold configuration
  - Notification preferences
  - Alert history

## API Documentation

### WebSocket Events

```typescript
// Subscribe to updates
ws.send(JSON.stringify({
  type: 'subscribe',
  placeId: 'your-place-id'
}));

// Receive updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch (data.type) {
    case 'review.new':
      // Handle new review
      break;
    case 'review.error':
      // Handle error
      break;
  }
};
```

### REST Endpoints

- `GET /api/alerts/:placeId` - Get recent alerts
- `POST /api/alerts/subscription/:placeId` - Subscribe to alerts
- `DELETE /api/alerts/subscription/:placeId` - Unsubscribe from alerts

## Development

### Commands

```bash
# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

### Testing

Run the test suite:
```bash
# Run all tests
npm test

# Run specific tests
npm test -- --grep "Alert System"

# Run with coverage
npm test -- --coverage
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter) - email@example.com

Project Link: [https://github.com/your-username/project-bolt](https://github.com/your-username/project-bolt)