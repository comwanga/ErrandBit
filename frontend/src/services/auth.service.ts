/**
 * Authentication Service
 * 
 * Manages user authentication including registration, login, OTP verification,
 * and profile management. Supports both username/password and phone-based OTP authentication.
 * 
 * @module services/auth
 */

import { httpClient } from './http.client';
import { STORAGE_KEYS } from '../config/app.config';

export interface OTPResponse {
  success: boolean;
  sessionId: string;
  message: string;
}

export interface VerifyResponse {
  success: boolean;
  token: string;
  user: {
    id: string | number;
    phone?: string;
    phone_number?: string;
    display_name: string;
    displayName?: string;
    username?: string;
  };
}

/**
 * User entity representing an authenticated user
 */
export interface User {
  id: string | number;
  phone?: string;
  phone_number?: string;
  display_name?: string;
  displayName?: string;
  email?: string;
  username?: string;
  avatar_url?: string;
  avatarUrl?: string;
  bio?: string;
  theme_preference?: string;
  created_at?: string;
  createdAt?: string;
}

/**
 * Normalize user data from API (handles snake_case and camelCase)
 */
function normalizeUser(user: any): User {
  return {
    id: user.id,
    phone: user.phone ?? user.phone_number,
    phone_number: user.phone_number ?? user.phone,
    display_name: user.display_name ?? user.displayName,
    displayName: user.displayName ?? user.display_name,
    email: user.email,
    username: user.username,
    avatar_url: user.avatar_url ?? user.avatarUrl,
    avatarUrl: user.avatarUrl ?? user.avatar_url,
    bio: user.bio,
    theme_preference: user.theme_preference,
    created_at: user.created_at ?? user.createdAt,
    createdAt: user.createdAt ?? user.created_at,
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  data?: {
    token: string;
    user: User;
  };
}

/**
 * Authentication Service
 * 
 * Manages user authentication state, token storage, and authentication operations.
 * Implements a singleton pattern for consistent state across the application.
 */
class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    this.loadFromStorage();
    this.setupAuthListener();
  }

  /**
   * Load authentication data from local storage
   */
  private loadFromStorage(): void {
    this.token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || localStorage.getItem('token');
    
    if (this.token) {
      httpClient.setAuthToken(this.token);
    }

    const storedUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser);
      } catch (e) {
        console.error('[Auth Service] Failed to parse stored user:', e);
        this.clearStorage();
      }
    }
  }

  /**
   * Setup listener for unauthorized events from http.client
   */
  private setupAuthListener(): void {
    window.addEventListener('auth:unauthorized', () => {
      this.logout();
    });
  }

  /**
   * Register a new user with username and password
   */
  public async register(username: string, password: string, displayName?: string): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>('/auth-simple/register', {
      username,
      password,
      display_name: displayName,
    });
    
    if (response.success && response.data) {
      this.setAuthData(response.data.token, response.data.user);
    } else if (response.success && response.token && response.user) {
      this.setAuthData(response.token, response.user);
    }
    
    return response;
  }

  /**
   * Login with username and password
   */
  public async login(username: string, password: string): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>('/auth-simple/login', {
      username,
      password,
    });
    
    if (response.success && response.data) {
      this.setAuthData(response.data.token, response.data.user);
    } else if (response.success && response.token && response.user) {
      this.setAuthData(response.token, response.user);
    }
    
    return response;
  }

  /**
   * Request OTP code for phone authentication
   */
  public async requestOTP(phone: string): Promise<OTPResponse> {
    const response = await httpClient.post<OTPResponse>('/auth/request-otp', { phone });
    return response;
  }

  /**
   * Verify OTP code and complete phone authentication
   */
  public async verifyOTP(sessionId: string, code: string): Promise<VerifyResponse> {
    const response = await httpClient.post<VerifyResponse>('/auth/verify-otp', {
      session_id: sessionId,
      code,
    });
    
    if (response.success && response.token && response.user) {
      this.setAuthData(response.token, response.user);
    }
    
    return response;
  }

  /**
   * Get current user profile from API
   */
  public async getProfile(): Promise<User> {
    const response = await httpClient.get<{ user?: User; data?: { user: User } }>('/auth-simple/me');
    
    const user = response.user || response.data?.user;
    if (!user) {
      throw new Error('User data not found in response');
    }
    
    const normalizedUser = normalizeUser(user);
    this.user = normalizedUser;
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(normalizedUser));
    
    return normalizedUser;
  }

  /**
   * Update current user profile
   */
  public async updateProfile(data: Partial<User>): Promise<User> {
    const response = await httpClient.put<{ user: User }>('/api/profile', data);
    
    if (response.user) {
      const normalizedUser = normalizeUser(response.user);
      this.user = { ...this.user, ...normalizedUser };
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(this.user));
    }
    
    return response.user;
  }

  /**
   * Store authentication data in memory and local storage
   */
  private setAuthData(token: string, user: User): void {
    const normalizedUser = normalizeUser(user);
    
    this.token = token;
    this.user = normalizedUser;
    
    httpClient.setAuthToken(token);
    
    localStorage.setItem('token', token);
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(normalizedUser));
  }

  /**
   * Clear storage and remove authentication data
   */
  private clearStorage(): void {
    localStorage.removeItem('token');
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  }

  /**
   * Logout current user and clear authentication state
   */
  public logout(): void {
    this.token = null;
    this.user = null;
    httpClient.setAuthToken(null);
    this.clearStorage();
    
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Get current authentication token
   */
  public getToken(): string | null {
    return this.token;
  }

  /**
   * Get current user data
   */
  public getUser(): User | null {
    return this.user;
  }

  /**
   * Update user data in memory and storage without API call
   */
  public updateUser(userData: Partial<User>): void {
    if (this.user) {
      this.user = { ...this.user, ...userData };
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(this.user));
    }
  }
}

/**
 * Singleton instance of AuthService
 */
export const authService = new AuthService();
