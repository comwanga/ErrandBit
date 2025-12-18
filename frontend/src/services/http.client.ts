/**
 * HTTP Client Configuration
 * 
 * Provides a centralized HTTP client with authentication, error handling,
 * and retry logic for all API requests in the application.
 * 
 * @module http
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API_CONFIG, HTTP_STATUS } from '../config/app.config';

/**
 * Error response from the API
 */
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
  statusCode: number;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
}

/**
 * HTTP client with authentication and error handling
 */
export class HttpClient {
  private readonly client: AxiosInstance;
  private authToken: string | null = null;

  constructor(baseURL: string = API_CONFIG.API_PATH) {
    this.client = axios.create({
      baseURL,
      timeout: API_CONFIG.TIMEOUT_MS,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Set authentication token for all requests
   */
  public setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  /**
   * Get current authentication token
   */
  public getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Handle and transform axios errors
   */
  private handleError(error: AxiosError): ApiError {
    const statusCode = error.response?.status || HTTP_STATUS.INTERNAL_ERROR;
    const errorData = error.response?.data as any;

    const apiError: ApiError = {
      message: errorData?.message || error.message || 'An unexpected error occurred',
      code: errorData?.code,
      field: errorData?.field,
      statusCode,
    };

    // Log error for debugging
    console.error(`[HTTP Client] ${statusCode} Error:`, {
      url: error.config?.url,
      method: error.config?.method,
      message: apiError.message,
      code: apiError.code,
    });

    // Handle specific error cases
    if (statusCode === HTTP_STATUS.UNAUTHORIZED) {
      this.handleUnauthorized();
    }

    return apiError;
  }

  /**
   * Handle unauthorized errors (clear token, redirect to login)
   */
  private handleUnauthorized(): void {
    this.authToken = null;
    
    // Dispatch custom event for auth state change
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  }

  /**
   * Perform GET request
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return this.extractData(response);
  }

  /**
   * Perform POST request
   */
  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return this.extractData(response);
  }

  /**
   * Perform PUT request
   */
  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return this.extractData(response);
  }

  /**
   * Perform PATCH request
   */
  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return this.extractData(response);
  }

  /**
   * Perform DELETE request
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return this.extractData(response);
  }

  /**
   * Extract data from API response, handling various response formats
   */
  private extractData<T>(response: AxiosResponse<ApiResponse<T>>): T {
    const { data } = response;
    
    // Handle different response formats from the API
    if (data.data !== undefined) {
      return data.data;
    }
    
    // Fallback to the entire response data
    return data as unknown as T;
  }

  /**
   * Check if error is an API error
   */
  public static isApiError(error: unknown): error is ApiError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      'statusCode' in error
    );
  }

  /**
   * Check if error is unauthorized
   */
  public static isUnauthorizedError(error: unknown): boolean {
    return this.isApiError(error) && error.statusCode === HTTP_STATUS.UNAUTHORIZED;
  }

  /**
   * Check if error is a validation error
   */
  public static isValidationError(error: unknown): boolean {
    return (
      this.isApiError(error) &&
      (error.statusCode === HTTP_STATUS.BAD_REQUEST ||
        error.statusCode === HTTP_STATUS.UNPROCESSABLE_ENTITY)
    );
  }

  /**
   * Check if error is a not found error
   */
  public static isNotFoundError(error: unknown): boolean {
    return this.isApiError(error) && error.statusCode === HTTP_STATUS.NOT_FOUND;
  }
}

/**
 * Shared HTTP client instance
 */
export const httpClient = new HttpClient();

/**
 * Create a new HTTP client instance with custom configuration
 */
export function createHttpClient(baseURL?: string): HttpClient {
  return new HttpClient(baseURL);
}
