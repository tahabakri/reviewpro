import { ReviewScraper } from '../../services/data-collection/scraper';
import { DataCollectionError } from '../../services/data-collection/base';
import axios from 'axios';
import cheerio from 'cheerio';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ReviewScraper', () => {
  let scraper: ReviewScraper;

  beforeEach(() => {
    scraper = new ReviewScraper();
  });

  describe('searchCompetitors', () => {
    it('should throw unsupported operation error', async () => {
      await expect(scraper.searchCompetitors('any', 'any'))
        .rejects
        .toThrow(DataCollectionError);
    });
  });

  describe('getReviews', () => {
    it('should parse reviews from HTML content', async () => {
      const mockHtml = `
        <div class="review-container">
          <div class="rating">4.5</div>
          <div class="review-content">Great service and food!</div>
          <div class="review-date">2023-01-01</div>
          <div class="author-name">John Doe</div>
        </div>
        <div class="review-container">
          <div class="rating">5.0</div>
          <div class="review-content">Excellent experience!</div>
          <div class="review-date">2023-01-02</div>
          <div class="author-name">Jane Smith</div>
        </div>
      `;

      mockedAxios.get.mockResolvedValueOnce({ data: mockHtml });

      const result = await scraper.getReviews('https://example.com/reviews');

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        rating: 4.5,
        content: 'Great service and food!',
        platform: 'web',
        metadata: {
          author: 'John Doe',
          raw_date: '2023-01-01',
        },
      });
      expect(result[1]).toMatchObject({
        rating: 5.0,
        content: 'Excellent experience!',
        platform: 'web',
        metadata: {
          author: 'Jane Smith',
          raw_date: '2023-01-02',
        },
      });
    });

    it('should handle missing rating gracefully', async () => {
      const mockHtml = `
        <div class="review-container">
          <div class="review-content">Great service!</div>
          <div class="review-date">2023-01-01</div>
          <div class="author-name">John Doe</div>
        </div>
      `;

      mockedAxios.get.mockResolvedValueOnce({ data: mockHtml });

      const result = await scraper.getReviews('https://example.com/reviews');

      expect(result).toHaveLength(1);
      expect(result[0].rating).toBe(0);
    });

    it('should handle missing review content', async () => {
      const mockHtml = `
        <div class="review-container">
          <div class="rating">4.5</div>
          <div class="review-date">2023-01-01</div>
          <div class="author-name">John Doe</div>
        </div>
      `;

      mockedAxios.get.mockResolvedValueOnce({ data: mockHtml });

      const result = await scraper.getReviews('https://example.com/reviews');
      expect(result).toHaveLength(0);
    });

    it('should handle network errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

      await expect(scraper.getReviews('https://example.com/reviews'))
        .rejects
        .toThrow(DataCollectionError);
    });

    it('should handle invalid HTML', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: '<invalid>html' });

      const result = await scraper.getReviews('https://example.com/reviews');
      expect(result).toHaveLength(0);
    });

    it('should normalize ratings to 5-star scale', async () => {
      const mockHtml = `
        <div class="review-container">
          <div class="rating">9.0</div>
          <div class="review-content">Great service!</div>
          <div class="review-date">2023-01-01</div>
          <div class="author-name">John Doe</div>
        </div>
      `;

      mockedAxios.get.mockResolvedValueOnce({ data: mockHtml });

      const result = await scraper.getReviews('https://example.com/reviews');

      expect(result).toHaveLength(1);
      expect(result[0].rating).toBe(4.5);
    });

    it('should handle relative dates', async () => {
      const mockHtml = `
        <div class="review-container">
          <div class="rating">4.5</div>
          <div class="review-content">Great service!</div>
          <div class="review-date">today</div>
          <div class="author-name">John Doe</div>
        </div>
      `;

      mockedAxios.get.mockResolvedValueOnce({ data: mockHtml });

      const result = await scraper.getReviews('https://example.com/reviews');

      expect(result).toHaveLength(1);
      expect(result[0].created_at).toBeDefined();
      expect(new Date(result[0].created_at)).toBeInstanceOf(Date);
    });
  });
});