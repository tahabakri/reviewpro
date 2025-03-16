import { useState, useEffect, useCallback } from 'react';
import { AnalyzedReviewUpdate } from '../../server/src/services/data-collection/types';

interface SentimentWebSocketState {
  connected: boolean;
  error: string | null;
  reviews: AnalyzedReviewUpdate[];
}

interface UseSentimentWebSocketReturn extends SentimentWebSocketState {
  subscribe: (placeId: string) => void;
  unsubscribe: (placeId: string) => void;
}

const WEBSOCKET_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;

export function useSentimentWebSocket(): UseSentimentWebSocketReturn {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [state, setState] = useState<SentimentWebSocketState>({
    connected: false,
    error: null,
    reviews: []
  });

  // Initialize WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(WEBSOCKET_URL);

    ws.onopen = () => {
      setState(prev => ({
        ...prev,
        connected: true,
        error: null
      }));
    };

    ws.onclose = () => {
      setState(prev => ({
        ...prev,
        connected: false
      }));

      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        setSocket(new WebSocket(WEBSOCKET_URL));
      }, 3000);
    };

    ws.onerror = () => {
      setState(prev => ({
        ...prev,
        error: 'WebSocket connection error'
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'review.new':
            setState(prev => ({
              ...prev,
              reviews: [message.data, ...prev.reviews].sort(
                (a, b) => b.time - a.time
              ).slice(0, 100) // Keep last 100 reviews
            }));
            break;

          case 'review.error':
            setState(prev => ({
              ...prev,
              error: message.data.message
            }));
            break;

          case 'subscribed':
            setState(prev => ({
              ...prev,
              error: null
            }));
            break;

          case 'unsubscribed':
            setState(prev => ({
              ...prev,
              reviews: []
            }));
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    setSocket(ws);

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, []);

  // Subscribe to a place's reviews
  const subscribe = useCallback((placeId: string) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'subscribe',
        placeId
      }));
    } else {
      setState(prev => ({
        ...prev,
        error: 'WebSocket not connected'
      }));
    }
  }, [socket]);

  // Unsubscribe from a place's reviews
  const unsubscribe = useCallback((placeId: string) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'unsubscribe',
        placeId
      }));
    }
  }, [socket]);

  return {
    ...state,
    subscribe,
    unsubscribe
  };
}

// Helper for calculating display information
export function getReviewStats(reviews: AnalyzedReviewUpdate[]) {
  const total = reviews.length;
  if (total === 0) return null;

  const positive = reviews.filter(r => r.sentiment.sentiment === 'positive').length;
  const negative = reviews.filter(r => r.sentiment.sentiment === 'negative').length;
  const neutral = total - positive - negative;

  const averageScore = reviews.reduce((sum, r) => sum + r.sentiment.score, 0) / total;

  return {
    total,
    positive,
    negative,
    neutral,
    averageScore,
    positiveRate: (positive / total) * 100,
    negativeRate: (negative / total) * 100,
    neutralRate: (neutral / total) * 100
  };
}