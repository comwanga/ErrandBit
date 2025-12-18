/**
 * Job Service
 * 
 * Manages job-related operations including creation, retrieval, updates,
 * and status transitions. Implements business logic for the job lifecycle.
 * 
 * @module services/job
 */

import { httpClient } from './http.client';
import { MAP_CONFIG } from '../config/app.config';

/**
 * Job status enum representing the lifecycle of a job
 */
export type JobStatus = 
  | 'open' 
  | 'accepted' 
  | 'in_progress' 
  | 'awaiting_payment' 
  | 'payment_confirmed' 
  | 'completed' 
  | 'disputed' 
  | 'cancelled';

/**
 * Job category types
 */
export type JobCategory = 
  | 'delivery' 
  | 'shopping' 
  | 'cleaning' 
  | 'moving' 
  | 'handyman' 
  | 'other';

/**
 * Geographic coordinates
 */
export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Job entity representing a work request in the system
 */
export interface Job {
  id: number;
  clientId: number;
  runnerId?: number;
  title: string;
  description: string;
  status: JobStatus;
  priceCents: number;
  location?: Coordinates;
  address: string;
  deadline?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Input data for creating a new job
 */
export interface CreateJobInput {
  title: string;
  description: string;
  category: JobCategory;
  pickup_lat: number;
  pickup_lng: number;
  pickup_address: string;
  dropoff_lat?: number;
  dropoff_lng?: number;
  dropoff_address?: string;
  budget_max_usd: number;
}

/**
 * Input data for updating an existing job
 */
export interface UpdateJobInput {
  title?: string;
  description?: string;
  priceCents?: number;
  address?: string;
  deadline?: string;
}

/**
 * Search parameters for finding jobs
 */
export interface JobSearchParams {
  lat: number;
  lng: number;
  radiusKm?: number;
  status?: JobStatus;
  category?: JobCategory;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * API response from the jobs endpoint
 */
interface ApiJob {
  id: number;
  client_id?: number;
  clientId?: number;
  runner_id?: number;
  runnerId?: number;
  title: string;
  description: string;
  status: JobStatus;
  price_cents?: number;
  priceCents?: number;
  location?: Coordinates;
  address: string;
  deadline?: string;
  completed_at?: string;
  completedAt?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

/**
 * Transform API response from snake_case to camelCase
 * Normalizes data structure for consistent usage in the application
 */
function transformJob(apiJob: ApiJob): Job {
  return {
    id: apiJob.id,
    clientId: apiJob.client_id ?? apiJob.clientId,
    runnerId: apiJob.runner_id ?? apiJob.runnerId,
    title: apiJob.title,
    description: apiJob.description,
    status: apiJob.status,
    priceCents: apiJob.price_cents ?? apiJob.priceCents,
    location: apiJob.location,
    address: apiJob.address || '',
    deadline: apiJob.deadline,
    completedAt: apiJob.completed_at ?? apiJob.completedAt,
    createdAt: apiJob.created_at ?? apiJob.createdAt ?? new Date().toISOString(),
    updatedAt: apiJob.updated_at ?? apiJob.updatedAt ?? new Date().toISOString(),
  };
}

/**
 * Job Service
 * 
 * Handles all job-related API operations. Provides methods for CRUD operations
 * and job lifecycle management (create, assign, start, complete, cancel).
 */
class JobService {
  private readonly endpoint = '/jobs';

  /**
   * Create a new job posting
   * 
   * @param data - Job creation input data
   * @returns Promise resolving to the created job
   * @throws {ApiError} When authentication fails or validation errors occur
   */
  public async createJob(data: CreateJobInput): Promise<Job> {
    const apiJob = await httpClient.post<ApiJob>(this.endpoint, data);
    return transformJob(apiJob);
  }

  /**
   * Search for jobs near a specific location
   * 
   * @param params - Search parameters including location and filters
   * @returns Promise resolving to array of matching jobs
   */
  public async searchNearbyJobs(params: JobSearchParams): Promise<Job[]> {
    const {
      lat,
      lng,
      radiusKm = MAP_CONFIG.DEFAULT_SEARCH_RADIUS_KM,
      status = 'open',
      ...filters
    } = params;

    const apiJobs = await httpClient.get<ApiJob[]>(`${this.endpoint}/search`, {
      params: {
        lat,
        lng,
        radiusKm,
        status,
        ...filters,
      },
    });

    return apiJobs.map(transformJob);
  }

  /**
   * Get all jobs created by or assigned to the current user
   * 
   * @returns Promise resolving to array of user's jobs
   */
  public async getMyJobs(): Promise<Job[]> {
    const apiJobs = await httpClient.get<ApiJob[]>(`${this.endpoint}/my-jobs`);
    return apiJobs.map(transformJob);
  }

  /**
   * Get a specific job by ID
   * 
   * @param id - Job identifier
   * @returns Promise resolving to the job details
   * @throws {ApiError} When job is not found
   */
  public async getJobById(id: number | string): Promise<Job> {
    const apiJob = await httpClient.get<ApiJob>(`${this.endpoint}/${id}`);
    return transformJob(apiJob);
  }

  /**
   * Update an existing job
   * 
   * @param id - Job identifier
   * @param data - Fields to update
   * @returns Promise resolving to the updated job
   * @throws {ApiError} When validation fails or job is not found
   */
  public async updateJob(id: number | string, data: UpdateJobInput): Promise<Job> {
    const apiJob = await httpClient.patch<ApiJob>(`${this.endpoint}/${id}`, data);
    return transformJob(apiJob);
  }

  /**
   * Assign a job to the current user (runner accepts job)
   * 
   * @param id - Job identifier
   * @returns Promise resolving to the updated job with runner assigned
   * @throws {ApiError} When job is already assigned or not available
   */
  public async assignJob(id: number | string): Promise<Job> {
    const apiJob = await httpClient.post<ApiJob>(`${this.endpoint}/${id}/assign`);
    return transformJob(apiJob);
  }

  /**
   * Mark a job as started (runner begins work)
   * 
   * @param id - Job identifier
   * @returns Promise resolving to the updated job
   * @throws {ApiError} When job is not in accepted status
   */
  public async startJob(id: number | string): Promise<Job> {
    const apiJob = await httpClient.post<ApiJob>(`${this.endpoint}/${id}/start`);
    return transformJob(apiJob);
  }

  /**
   * Mark a job as completed (runner finishes work)
   * 
   * @param id - Job identifier
   * @returns Promise resolving to the updated job
   * @throws {ApiError} When job is not in progress
   */
  public async completeJob(id: number | string): Promise<Job> {
    const apiJob = await httpClient.post<ApiJob>(`${this.endpoint}/${id}/complete`);
    return transformJob(apiJob);
  }

  /**
   * Cancel a job
   * 
   * @param id - Job identifier
   * @param reason - Optional cancellation reason
   * @returns Promise resolving to the cancelled job
   * @throws {ApiError} When job cannot be cancelled (e.g., already completed)
   */
  public async cancelJob(id: number | string, reason?: string): Promise<Job> {
    const apiJob = await httpClient.post<ApiJob>(`${this.endpoint}/${id}/cancel`, { reason });
    return transformJob(apiJob);
  }

  /**
   * Dispute a job (raise an issue with job completion)
   * 
   * @param id - Job identifier
   * @param reason - Dispute reason (required)
   * @returns Promise resolving to the disputed job
   * @throws {ApiError} When validation fails or job cannot be disputed
   */
  public async disputeJob(id: number | string, reason: string): Promise<Job> {
    const apiJob = await httpClient.post<ApiJob>(`${this.endpoint}/${id}/dispute`, { reason });
    return transformJob(apiJob);
  }

  /**
   * Check if a job status allows assignment
   * 
   * @param status - Current job status
   * @returns True if job can be assigned
   */
  public canAssignJob(status: JobStatus): boolean {
    return status === 'open';
  }

  /**
   * Check if a job status allows starting
   * 
   * @param status - Current job status
   * @returns True if job can be started
   */
  public canStartJob(status: JobStatus): boolean {
    return status === 'accepted';
  }

  /**
   * Check if a job status allows completion
   * 
   * @param status - Current job status
   * @returns True if job can be completed
   */
  public canCompleteJob(status: JobStatus): boolean {
    return status === 'in_progress';
  }

  /**
   * Check if a job status allows cancellation
   * 
   * @param status - Current job status
   * @returns True if job can be cancelled
   */
  public canCancelJob(status: JobStatus): boolean {
    return ['open', 'accepted', 'in_progress'].includes(status);
  }

  /**
   * Calculate job progress percentage
   * 
   * @param status - Current job status
   * @returns Progress percentage (0-100)
   */
  public getJobProgress(status: JobStatus): number {
    const progressMap: Record<JobStatus, number> = {
      open: 0,
      accepted: 25,
      in_progress: 50,
      awaiting_payment: 75,
      payment_confirmed: 90,
      completed: 100,
      disputed: 50,
      cancelled: 0,
    };

    return progressMap[status] || 0;
  }
}

/**
 * Singleton instance of JobService
 */
export const jobService = new JobService();
