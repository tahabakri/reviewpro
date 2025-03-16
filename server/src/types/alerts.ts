export interface AlertThresholds {
  sentimentDrop: number;   // e.g., 0.2 for 20% drop
  negativeSpike: number;   // e.g., 0.3 for 30% negative reviews
  volumeIncrease: number;  // e.g., 2 for double the normal volume
  timeWindow: number;      // in milliseconds
}

export interface AlertConfig {
  thresholds: AlertThresholds;
  checkInterval: number;   // in milliseconds
}

export interface SentimentAlert {
  type: 'sentiment-drop' | 'negative-spike' | 'volume-increase';
  placeId: string;
  message: string;
  data: {
    previous: number;
    current: number;
    threshold: number;
  };
  timestamp: Date;
}

export interface AlertsState {
  enabled: boolean;
  config: AlertConfig;
  activeAlerts: SentimentAlert[];
}

export interface AlertSubscription {
  placeId: string;
  email?: string;
  webhook?: string;
  thresholds?: Partial<AlertThresholds>;
}