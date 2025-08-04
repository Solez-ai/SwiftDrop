import { APP_CONFIG } from '../config';
import { storageService } from './storage.service';
import { showError } from '../utils/notificationUtils';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  requireAuth?: boolean;
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

class ApiService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private authToken: string | null = null;

  constructor(baseUrl: string = APP_CONFIG.API_BASE_URL) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-App-Version': APP_CONFIG.APP_VERSION,
    };
  }

  /**
   * Set the authentication token
   */
  public setAuthToken(token: string | null): void {
    this.authToken = token;
    
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders['Authorization'];
    }
  }

  /**
   * Make an API request
   */
  public async request<T = any>(
    endpoint: string,
    method: HttpMethod = 'GET',
    data: any = null,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      headers = {},
      params = {},
      timeout = APP_CONFIG.API_TIMEOUT,
      retries = 2,
      retryDelay = 1000,
      requireAuth = true,
      ...fetchOptions
    } = options;

    // Add authentication token if required
    if (requireAuth && this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    // Handle query parameters
    const queryString = this.buildQueryString(params);
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}${queryString}`;

    // Prepare request config
    const config: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...headers,
      },
      ...fetchOptions,
    };

    // Add request body for non-GET requests
    if (method !== 'GET' && data) {
      if (data instanceof FormData) {
        // For file uploads, let the browser set the Content-Type with boundary
        delete config.headers?.['Content-Type'];
        config.body = data;
      } else if (typeof data === 'object') {
        config.body = JSON.stringify(data);
      } else {
        config.body = data;
      }
    }

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    config.signal = controller.signal;

    // Make the request with retry logic
    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt <= retries) {
      try {
        const response = await fetch(url, config);
        clearTimeout(timeoutId);

        // Handle HTTP errors
        if (!response.ok) {
          const errorData = await this.parseResponse(response);
          throw new ApiError(
            errorData?.message || 'Request failed',
            response.status,
            errorData
          );
        }

        // Parse successful response
        const responseData = await this.parseResponse(response);

        return {
          data: responseData,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        };
      } catch (error) {
        lastError = error;
        
        // Don't retry on certain errors
        if (
          error instanceof ApiError && 
          (error.status === 401 || error.status === 403 || error.status === 404)
        ) {
          break;
        }

        // Don't retry if aborted due to timeout
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout', 408);
        }

        attempt++;
        
        // Wait before retry
        if (attempt <= retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
      }
    }

    // All retries failed
    throw lastError || new Error('Request failed');
  }

  /**
   * Parse the response based on content type
   */
  private async parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      return response.json();
    }
    
    if (contentType.includes('text/')) {
      return response.text();
    }
    
    return response.blob();
  }

  /**
   * Build query string from params object
   */
  private buildQueryString(params: Record<string, any> = {}): string {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => queryParams.append(key, String(item)));
        } else if (typeof value === 'object') {
          queryParams.append(key, JSON.stringify(value));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });
    
    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  // Convenience methods
  public get<T = any>(endpoint: string, params?: any, options?: Omit<RequestOptions, 'params'>) {
    return this.request<T>(endpoint, 'GET', undefined, { ...options, params });
  }

  public post<T = any>(endpoint: string, data?: any, options?: RequestOptions) {
    return this.request<T>(endpoint, 'POST', data, options);
  }

  public put<T = any>(endpoint: string, data?: any, options?: RequestOptions) {
    return this.request<T>(endpoint, 'PUT', data, options);
  }

  public patch<T = any>(endpoint: string, data?: any, options?: RequestOptions) {
    return this.request<T>(endpoint, 'PATCH', data, options);
  }

  public delete<T = any>(endpoint: string, data?: any, options?: RequestOptions) {
    return this.request<T>(endpoint, 'DELETE', data, options);
  }

  /**
   * Upload a file with progress tracking
   */
  public async upload<T = any>(
    endpoint: string,
    file: File,
    fieldName: string = 'file',
    additionalData: Record<string, any> = {},
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    // Append additional data
    Object.entries(additionalData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    });

    // Use XMLHttpRequest for upload progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.open('POST', `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, true);
      
      // Set headers
      Object.entries({
        ...this.defaultHeaders,
        'Authorization': this.authToken ? `Bearer ${this.authToken}` : undefined,
      }).forEach(([key, value]) => {
        if (value) xhr.setRequestHeader(key, value);
      });
      
      // Remove Content-Type header to let the browser set it with the correct boundary
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      
      // Progress tracking
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          let data;
          try {
            const contentType = xhr.getResponseHeader('content-type');
            data = contentType?.includes('application/json') 
              ? JSON.parse(xhr.responseText) 
              : xhr.responseText;
          } catch (e) {
            data = xhr.responseText;
          }
          
          resolve({
            data,
            status: xhr.status,
            statusText: xhr.statusText,
            headers: new Headers(xhr.getAllResponseHeaders().split('\r\n').reduce((headers, line) => {
              const parts = line.split(': ');
              if (parts.length === 2) headers[parts[0]] = parts[1];
              return headers;
            }, {} as Record<string, string>)),
          });
        } else {
          let errorData;
          try {
            errorData = JSON.parse(xhr.responseText);
          } catch (e) {
            errorData = { message: xhr.statusText };
          }
          
          reject(new ApiError(
            errorData?.message || 'Request failed',
            xhr.status,
            errorData
          ));
        }
      };
      
      xhr.onerror = () => {
        reject(new ApiError('Network error', 0));
      };
      
      xhr.send(formData);
    });
  }
}

/**
 * Custom API error class
 */
class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 0,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

// Export a singleton instance
export const apiService = new ApiService();

export default apiService;
