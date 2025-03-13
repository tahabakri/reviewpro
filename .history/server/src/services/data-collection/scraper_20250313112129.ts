import axios from 'axios';
import cheerio from 'cheerio';
import { DataCollectionService, DataCollectionError, RateLimiter, ReviewData, CompetitorData } from './base';
import { monitoring } from '../../monitoring';

interface ScraperConfig {
  selectors: {
    reviewContainer: string;
    rating: string;
    content: string;
    date: string;
    author: string;
  };
  dateFormat: string;
  rateLimit: {
    requestsPerSecond: number;
    maxRetries: number;
    retryDelay: number;
  };
}

export class ReviewScraper extends DataCollectionService {
  readonly platform = 'web';
  private rateLimiter: RateLimiter;
  private configs: Record<string, ScraperConfig>;

  async searchCompetitors(/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    query: string,
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    location: string
  ): Promise<CompetitorData[]> {
    throw new DataCollectionError(
      'Direct competitor search is not supported for web scraping',
      this.platform
    );
  }

  constructor() {
    super();
    this.rateLimiter = new RateLimiter({
      requestsPerSecond: 2,
      maxRetries: 3,
      retryDelay: 2000,
    });

    // Configure scrapers for different sites
    this.configs = {
      'default': {
        selectors: {
          reviewContainer: '.review-container',
          rating: '.rating',
          content: '.review-content',
          date: '.review-date',
          author: '.author-name',
        },
        dateFormat: 'YYYY-MM-DD',
        rateLimit: {
          requestsPerSecond: 2,
          maxRetries: 3,
          retryDelay: 2000,
        },
      },
      // Add more site-specific configurations as needed
    };
  }

  async getReviews(url: string, siteName = 'default'): Promise<ReviewData[]> {
    try {
      const config = this.configs[siteName] || this.configs['default'];
      const html = await this.fetchPage(url);
      const reviews = await this.parseReviews(html, config);

      monitoring.trackDataCollection('scraper', 'success');
      return reviews;
    } catch (error) {
      monitoring.trackDataCollection('scraper', 'error');
      throw new DataCollectionError(
        `Failed to scrape reviews: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.platform
      );
    }
  }

  private async fetchPage(url: string): Promise<string> {
    return await this.rateLimiter.execute(async () => {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        timeout: 10000,
      });
      return response.data;
    });
  }

  private async parseReviews(html: string, config: ScraperConfig): Promise<ReviewData[]> {
    const $ = cheerio.load(html);
    const reviews: ReviewData[] = [];

    $(config.selectors.reviewContainer).each((_, element) => {
      try {
        const rating = this.extractRating($(element).find(config.selectors.rating).text());
        const content = $(element).find(config.selectors.content).text().trim();
        const dateStr = $(element).find(config.selectors.date).text().trim();
        const author = $(element).find(config.selectors.author).text().trim();

        if (rating && content) {
          reviews.push({
            id: this.generateId(this.platform, `${Date.now()}_${reviews.length}`),
            rating,
            content,
            platform: this.platform,
            created_at: this.parseDate(dateStr),
            metadata: {
              author,
              raw_date: dateStr,
            },
          });
        }
      } catch (error) {
        console.error('Error parsing review:', error);
      }
    });

    return reviews;
  }

  private extractRating(ratingText: string): number {
    // Convert various rating formats to a number out of 5
    const number = parseFloat(ratingText.replace(/[^\d.]/g, ''));
    if (isNaN(number)) return 0;
    
    // Normalize to 5-star scale
    if (number > 5) {
      return (number / 2);
    }
    return number;
  }

  private parseDate(dateStr: string): string {
    try {
      // Handle various date formats
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        // If direct parsing fails, try to handle relative dates
        if (dateStr.toLowerCase().includes('today')) {
          return new Date().toISOString();
        }
        if (dateStr.toLowerCase().includes('yesterday')) {
          const date = new Date();
          date.setDate(date.getDate() - 1);
          return date.toISOString();
        }
        // Default to current date if parsing fails
        return new Date().toISOString();
      }
      return date.toISOString();
    } catch (error) {
      console.error('Error parsing date:', error);
      return new Date().toISOString();
    }
  }
}