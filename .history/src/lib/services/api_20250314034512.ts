import { supabase } from '../supabase';
import { Database } from '../database.types';

type Business = Database['public']['Tables']['businesses']['Row'];
type Competitor = Database['public']['Tables']['competitors']['Row'];
type Review = Database['public']['Tables']['reviews']['Row'];
type Sentiment = Database['public']['Tables']['sentiments']['Row'];
type Theme = Database['public']['Tables']['themes']['Row'];
type Alert = Database['public']['Tables']['alerts']['Row'];

export class BusinessService {
  static async create(data: Omit<Business, 'id' | 'created_at'>) {
    const { data: business, error } = await supabase
      .from('businesses')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return business;
  }

  static async getById(id: string) {
    // Don't use .single() to avoid errors when no business is found
    const { data, error } = await supabase
      .from('businesses')
      .select(`
        *,
        competitors (*)
      `)
      .eq('id', id);

    if (error) throw error;
    // Return the first business or null if none found
    return data && data.length > 0 ? data[0] : null;
  }

  static async list() {
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('*');

    if (error) throw error;
    return businesses;
  }
}

export class CompetitorService {
  static async create(data: Omit<Competitor, 'id'>) {
    const { data: competitor, error } = await supabase
      .from('competitors')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return competitor;
  }

  static async getByBusinessId(businessId: string) {
    const { data: competitors, error } = await supabase
      .from('competitors')
      .select(`
        *,
        reviews (*)
      `)
      .eq('business_id', businessId);

    if (error) throw error;
    return competitors;
  }
}

export class ReviewService {
  static async create(data: Omit<Review, 'id' | 'created_at'>) {
    const { data: review, error } = await supabase
      .from('reviews')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return review;
  }

  static async getByEntityId(entityId: string) {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        sentiments (*),
        themes (*)
      `)
      .eq('entity_id', entityId);

    if (error) throw error;
    return reviews;
  }
}

export class SentimentService {
  static async create(data: Omit<Sentiment, 'id' | 'created_at'>) {
    const { data: sentiment, error } = await supabase
      .from('sentiments')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return sentiment;
  }

  static async getByReviewId(reviewId: string) {
    const { data: sentiment, error } = await supabase
      .from('sentiments')
      .select('*')
      .eq('review_id', reviewId)
      .single();

    if (error) throw error;
    return sentiment;
  }
}

export class ThemeService {
  static async create(data: Omit<Theme, 'id'>) {
    const { data: theme, error } = await supabase
      .from('themes')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return theme;
  }

  static async getByReviewId(reviewId: string) {
    const { data: themes, error } = await supabase
      .from('themes')
      .select('*')
      .eq('review_id', reviewId);

    if (error) throw error;
    return themes;
  }

  static async getTopThemes(entityId: string) {
    const { data: themes, error } = await supabase
      .from('themes')
      .select('category, sentiment, frequency')
      .eq('review_id', entityId)
      .order('frequency', { ascending: false })
      .limit(5);

    if (error) throw error;
    return themes;
  }
}

export class AlertService {
  static async create(data: Omit<Alert, 'id'>) {
    const { data: alert, error } = await supabase
      .from('alerts')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return alert;
  }

  static async getByBusinessId(businessId: string) {
    const { data: alerts, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('business_id', businessId);

    if (error) throw error;
    return alerts;
  }

  static async updateStatus(id: string, active: boolean) {
    const { data: alert, error } = await supabase
      .from('alerts')
      .update({ active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return alert;
  }
}