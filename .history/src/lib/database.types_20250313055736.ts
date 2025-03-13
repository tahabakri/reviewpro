export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string;
          name: string;
          location: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          location: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string;
          metadata?: Json;
          created_at?: string;
        };
      };
      competitors: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          platform: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          platform: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          platform?: string;
          metadata?: Json;
        };
      };
      reviews: {
        Row: {
          id: string;
          entity_id: string;
          rating: number;
          content: string;
          created_at: string;
          platform: string;
        };
        Insert: {
          id?: string;
          entity_id: string;
          rating: number;
          content: string;
          created_at?: string;
          platform: string;
        };
        Update: {
          id?: string;
          entity_id?: string;
          rating?: number;
          content?: string;
          created_at?: string;
          platform?: string;
        };
      };
      sentiments: {
        Row: {
          id: string;
          review_id: string;
          score: number;
          analysis: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          review_id: string;
          score: number;
          analysis: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          review_id?: string;
          score?: number;
          analysis?: Json;
          created_at?: string;
        };
      };
      themes: {
        Row: {
          id: string;
          review_id: string;
          category: string;
          sentiment: number;
          frequency: number;
        };
        Insert: {
          id?: string;
          review_id: string;
          category: string;
          sentiment: number;
          frequency: number;
        };
        Update: {
          id?: string;
          review_id?: string;
          category?: string;
          sentiment?: number;
          frequency?: number;
        };
      };
      alerts: {
        Row: {
          id: string;
          business_id: string;
          type: string;
          conditions: Json;
          active: boolean;
        };
        Insert: {
          id?: string;
          business_id: string;
          type: string;
          conditions: Json;
          active?: boolean;
        };
        Update: {
          id?: string;
          business_id?: string;
          type?: string;
          conditions?: Json;
          active?: boolean;
        };
      };
    };
  };
}