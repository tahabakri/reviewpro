export interface AlertThresholds {
  sentimentDrop: number;
  negativeSpike: number;
  volumeIncrease: number;
  timeWindow: number;
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

export interface AlertSubscription {
  active: boolean;
  thresholds?: AlertThresholds;
}