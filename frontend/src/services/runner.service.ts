/**
 * Runner Service
 * 
 * Manages runner profile operations including creation, updates,
 * and searching for available runners.
 * 
 * @module services/runner
 */

import { httpClient } from './http.client';
import { MAP_CONFIG } from '../config/app.config';

/**
 * Runner profile entity
 */
export interface RunnerProfile {
  id: number;
  userId: number;
  user_id?: number;
  bio: string;
  tags: string[];
  hourlyRate?: number;
  hourly_rate?: number;
  serviceRadius?: number;
  service_radius?: number;
  available?: boolean;
  location?: {
    lat: number;
    lng: number;
  };
  address?: string;
  avgRating?: number;
  avg_rating?: number;
  totalJobs: number;
  total_jobs?: number;
  completionRate?: number;
  completion_rate?: number;
  createdAt: string;
  created_at?: string;
  updatedAt: string;
  updated_at?: string;
  displayName?: string;
  display_name?: string;
  lightningAddress?: string;
  lightning_address?: string;
  avatarUrl?: string;
  avatar_url?: string;
}

/**
 * Normalize runner profile data from API
 */
function normalizeRunnerProfile(profile: any): RunnerProfile {
  return {
    id: profile.id,
    userId: profile.user_id ?? profile.userId,
    user_id: profile.user_id ?? profile.userId,
    bio: profile.bio,
    tags: profile.tags || [],
    hourlyRate: profile.hourly_rate ?? profile.hourlyRate,
    hourly_rate: profile.hourly_rate ?? profile.hourlyRate,
    serviceRadius: profile.service_radius ?? profile.serviceRadius,
    service_radius: profile.service_radius ?? profile.serviceRadius,
    available: profile.available ?? false,
    location: profile.location,
    address: profile.address,
    avgRating: parseFloat(profile.avg_rating ?? profile.avgRating ?? '0'),
    avg_rating: parseFloat(profile.avg_rating ?? profile.avgRating ?? '0'),
    totalJobs: profile.total_jobs ?? profile.totalJobs ?? 0,
    total_jobs: profile.total_jobs ?? profile.totalJobs ?? 0,
    completionRate: parseFloat(profile.completion_rate ?? profile.completionRate ?? '0'),
    completion_rate: parseFloat(profile.completion_rate ?? profile.completionRate ?? '0'),
    createdAt: profile.created_at ?? profile.createdAt,
    created_at: profile.created_at ?? profile.createdAt,
    updatedAt: profile.updated_at ?? profile.updatedAt,
    updated_at: profile.updated_at ?? profile.updatedAt,
    displayName: profile.display_name ?? profile.displayName,
    display_name: profile.display_name ?? profile.displayName,
    lightningAddress: profile.lightning_address ?? profile.lightningAddress,
    lightning_address: profile.lightning_address ?? profile.lightningAddress,
    avatarUrl: profile.avatar_url ?? profile.avatarUrl,
    avatar_url: profile.avatar_url ?? profile.avatarUrl,
  };
}

export interface CreateRunnerInput {
  displayName: string;
  bio: string;
  tags: string[];
  hourlyRate?: number;
  serviceRadius: number;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  available: boolean;
}

export interface UpdateRunnerInput {
  bio?: string;
  tags?: string[];
  hourlyRate?: number;
  serviceRadius?: number;
  available?: boolean;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
}


/**
 * Runner Service
 * 
 * Handles runner profile management including CRUD operations,
 * search functionality, and availability management.
 */
class RunnerService {
  private readonly endpoint = '/runners';

  /**
   * Create a new runner profile
   */
  public async createProfile(data: CreateRunnerInput): Promise<RunnerProfile> {
    const response = await httpClient.post<any>(this.endpoint, {
      display_name: data.displayName,
      bio: data.bio,
      tags: data.tags,
      hourly_rate: data.hourlyRate,
      service_radius: data.serviceRadius,
      location: data.location,
      available: data.available,
    });
    
    const profile = response.data || response.runner;
    return normalizeRunnerProfile(profile);
  }

  /**
   * Get current user's runner profile
   */
  public async getMyProfile(): Promise<RunnerProfile> {
    const response = await httpClient.get<any>(`${this.endpoint}/me`);
    const profile = response.data || response.runner;
    return normalizeRunnerProfile(profile);
  }

  /**
   * Get a runner profile by ID
   */
  public async getProfileById(id: number | string): Promise<RunnerProfile> {
    const response = await httpClient.get<any>(`${this.endpoint}/${id}`);
    const profile = response.data || response.runner;
    return normalizeRunnerProfile(profile);
  }

  /**
   * Update a runner profile
   */
  public async updateProfile(id: number | string, data: UpdateRunnerInput): Promise<RunnerProfile> {
    const updateData: any = {};
    
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.hourlyRate !== undefined) updateData.hourly_rate = data.hourlyRate;
    if (data.serviceRadius !== undefined) updateData.service_radius = data.serviceRadius;
    if (data.available !== undefined) updateData.available = data.available;
    if (data.location !== undefined) updateData.location = data.location;
    
    const response = await httpClient.patch<any>(`${this.endpoint}/${id}`, updateData);
    const profile = response.data || response.runner;
    return normalizeRunnerProfile(profile);
  }

  /**
   * Update runner location
   */
  public async updateLocation(id: number | string, location: { lat: number; lng: number; address?: string }): Promise<RunnerProfile> {
    return this.updateProfile(id, { location });
  }

  /**
   * Toggle runner availability
   */
  public async toggleAvailability(id: number | string, available: boolean): Promise<RunnerProfile> {
    return this.updateProfile(id, { available });
  }

  /**
   * Search for runners near a location
   */
  public async searchNearby(lat: number, lng: number, radius: number = MAP_CONFIG.DEFAULT_SEARCH_RADIUS_KM): Promise<RunnerProfile[]> {
    const response = await httpClient.get<any>(`${this.endpoint}/search`, {
      params: { lat, lng, radius },
    });

    const profiles = response.data || response.runners || [];
    return profiles.map(normalizeRunnerProfile);
  }

  /**
   * Check if a runner is highly rated (4+ stars)
   */
  public isHighlyRated(profile: RunnerProfile): boolean {
    const rating = profile.avgRating ?? profile.avg_rating ?? 0;
    return rating >= 4.0;
  }

  /**
   * Check if a runner is experienced (10+ jobs)
   */
  public isExperienced(profile: RunnerProfile, minJobs: number = 10): boolean {
    const totalJobs = profile.totalJobs ?? profile.total_jobs ?? 0;
    return totalJobs >= minJobs;
  }
}

/**
 * Singleton instance of RunnerService
 */
export const runnerService = new RunnerService();
