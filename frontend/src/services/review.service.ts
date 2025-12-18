/**
 * Review Service
 * Handles review and rating operations
 * 
 * @module services/review
 */

import { httpClient } from './http.client';
import { REVIEW_CONFIG } from '../config/app.config';

/**
 * Review data structure
 */
export interface Review {
  id: number;
  jobId: number;
  reviewerId: number;
  revieweeId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  reviewer?: {
    id: number;
    username: string;
  };
  reviewee?: {
    id: number;
    username: string;
  };
}

/**
 * Runner rating statistics
 */
export interface RunnerRatingStats {
  runnerId: number;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
}

/**
 * Review submission data
 */
export interface ReviewSubmission {
  jobId: number;
  rating: number;
  comment?: string;
}

/**
 * Review update data
 */
export interface ReviewUpdate {
  rating?: number;
  comment?: string;
}

/**
 * Review Service
 * Professional service for managing reviews and ratings
 */
class ReviewService {
  /**
   * Normalize review data from API response
   * Handles both snake_case and camelCase responses
   * 
   * @param data - Raw review data from API
   * @returns Normalized Review object
   */
  private normalizeReview(data: any): Review {
    return {
      id: data.id,
      jobId: data.job_id || data.jobId,
      reviewerId: data.reviewer_id || data.reviewerId,
      revieweeId: data.reviewee_id || data.revieweeId,
      rating: typeof data.rating === 'string' ? parseFloat(data.rating) : data.rating,
      comment: data.comment,
      createdAt: data.created_at || data.createdAt,
      updatedAt: data.updated_at || data.updatedAt,
      reviewer: data.reviewer,
      reviewee: data.reviewee,
    };
  }

  /**
   * Normalize rating stats from API response
   * 
   * @param data - Raw stats data from API
   * @returns Normalized RunnerRatingStats object
   */
  private normalizeStats(data: any): RunnerRatingStats {
    return {
      runnerId: data.runner_id || data.runnerId,
      averageRating: typeof data.average_rating === 'string' 
        ? parseFloat(data.average_rating) 
        : data.averageRating || data.average_rating,
      totalReviews: data.total_reviews || data.totalReviews,
      ratingDistribution: data.rating_distribution || data.ratingDistribution,
    };
  }

  /**
   * Validate review submission data
   * 
   * @param data - Review submission data
   * @throws Error if validation fails
   */
  private validateReviewSubmission(data: ReviewSubmission): void {
    if (!data.jobId || data.jobId <= 0) {
      throw new Error('Invalid job ID');
    }

    if (!data.rating || data.rating < REVIEW_CONFIG.MIN_RATING || data.rating > REVIEW_CONFIG.MAX_RATING) {
      throw new Error(`Rating must be between ${REVIEW_CONFIG.MIN_RATING} and ${REVIEW_CONFIG.MAX_RATING}`);
    }

    if (data.comment && data.comment.length > REVIEW_CONFIG.MAX_COMMENT_LENGTH) {
      throw new Error(`Comment must not exceed ${REVIEW_CONFIG.MAX_COMMENT_LENGTH} characters`);
    }
  }

  /**
   * Validate review update data
   * 
   * @param data - Review update data
   * @throws Error if validation fails
   */
  private validateReviewUpdate(data: ReviewUpdate): void {
    if (data.rating !== undefined && (data.rating < REVIEW_CONFIG.MIN_RATING || data.rating > REVIEW_CONFIG.MAX_RATING)) {
      throw new Error(`Rating must be between ${REVIEW_CONFIG.MIN_RATING} and ${REVIEW_CONFIG.MAX_RATING}`);
    }

    if (data.comment && data.comment.length > REVIEW_CONFIG.MAX_COMMENT_LENGTH) {
      throw new Error(`Comment must not exceed ${REVIEW_CONFIG.MAX_COMMENT_LENGTH} characters`);
    }
  }

  /**
   * Submit a review for a completed job
   * 
   * @param data - Review submission data (jobId, rating, optional comment)
   * @returns Promise resolving to the created Review
   * @throws Error if validation fails or API request fails
   */
  async submitReview(data: ReviewSubmission): Promise<Review> {
    this.validateReviewSubmission(data);

    const response = await httpClient.post('/reviews', data);
    const reviewData = response.data.data || response.data.review;
    return this.normalizeReview(reviewData);
  }

  /**
   * Get review by job ID
   * 
   * @param jobId - Job ID
   * @returns Promise resolving to Review or null if not found
   */
  async getReviewByJobId(jobId: number): Promise<Review | null> {
    try {
      const response = await httpClient.get(`/reviews/job/${jobId}`);
      const reviewData = response.data.data || response.data.review;
      return this.normalizeReview(reviewData);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get all reviews for a runner (as reviewee)
   * 
   * @param runnerId - Runner user ID
   * @returns Promise resolving to array of Reviews
   */
  async getReviewsForRunner(runnerId: number): Promise<Review[]> {
    try {
      const response = await httpClient.get(`/reviews/runner/${runnerId}`);
      const reviews = response.data.data || response.data.reviews || [];
      return reviews.map((r: any) => this.normalizeReview(r));
    } catch (error: any) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Get reviews written by a user
   * 
   * @param reviewerId - Reviewer user ID
   * @returns Promise resolving to array of Reviews
   */
  async getReviewsByReviewer(reviewerId: number): Promise<Review[]> {
    try {
      const response = await httpClient.get(`/reviews/reviewer/${reviewerId}`);
      const reviews = response.data.data || response.data.reviews || [];
      return reviews.map((r: any) => this.normalizeReview(r));
    } catch (error: any) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Get comprehensive rating statistics for a runner
   * 
   * @param runnerId - Runner user ID
   * @returns Promise resolving to RunnerRatingStats or null if not found
   */
  async getRunnerRatingStats(runnerId: number): Promise<RunnerRatingStats | null> {
    try {
      const response = await httpClient.get(`/reviews/runner/${runnerId}/stats`);
      const stats = response.data.data || response.data.stats;
      return this.normalizeStats(stats);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Update an existing review
   * 
   * @param reviewId - Review ID
   * @param data - Updated review data (rating, comment)
   * @returns Promise resolving to updated Review
   * @throws Error if validation fails or API request fails
   */
  async updateReview(reviewId: number, data: ReviewUpdate): Promise<Review> {
    this.validateReviewUpdate(data);

    const response = await httpClient.patch(`/reviews/${reviewId}`, data);
    const reviewData = response.data.data || response.data.review;
    return this.normalizeReview(reviewData);
  }

  /**
   * Delete a review
   * 
   * @param reviewId - Review ID
   * @returns Promise resolving when deletion is complete
   */
  async deleteReview(reviewId: number): Promise<void> {
    await httpClient.delete(`/reviews/${reviewId}`);
  }

  /**
   * Calculate average rating from multiple reviews
   * 
   * @param reviews - Array of reviews
   * @returns Average rating or 0 if no reviews
   */
  calculateAverageRating(reviews: Review[]): number {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  }

  /**
   * Check if a runner is highly rated
   * 
   * @param stats - Runner rating statistics
   * @returns True if average rating meets or exceeds threshold
   */
  isHighlyRated(stats: RunnerRatingStats): boolean {
    return stats.averageRating >= REVIEW_CONFIG.HIGH_RATING_THRESHOLD;
  }

  /**
   * Check if a runner has enough reviews to be considered established
   * 
   * @param stats - Runner rating statistics
   * @returns True if total reviews meets or exceeds threshold
   */
  hasEnoughReviews(stats: RunnerRatingStats): boolean {
    return stats.totalReviews >= REVIEW_CONFIG.MIN_REVIEWS_FOR_ESTABLISHED;
  }

  /**
   * Get rating distribution as percentages
   * 
   * @param stats - Runner rating statistics
   * @returns Object with percentage for each rating (1-5)
   */
  getRatingPercentages(stats: RunnerRatingStats): Record<string, number> {
    const total = stats.totalReviews;
    if (total === 0) {
      return { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    }

    return {
      '1': (stats.ratingDistribution['1'] / total) * 100,
      '2': (stats.ratingDistribution['2'] / total) * 100,
      '3': (stats.ratingDistribution['3'] / total) * 100,
      '4': (stats.ratingDistribution['4'] / total) * 100,
      '5': (stats.ratingDistribution['5'] / total) * 100,
    };
  }

  /**
   * Format rating for display (e.g., "4.5")
   * 
   * @param rating - Numeric rating
   * @returns Formatted rating string
   */
  formatRating(rating: number): string {
    return rating.toFixed(1);
  }
}

export const reviewService = new ReviewService();
