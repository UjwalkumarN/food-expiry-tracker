import { Product, User, Notification, Recipe } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('freshguard_token');
};

// API request helper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Auth APIs
export const authAPI = {
  login: async (email: string): Promise<{ token: string; user: User }> => {
    const data = await apiRequest<{ success: boolean; token: string; user: User }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      }
    );
    localStorage.setItem('freshguard_token', data.token);
    localStorage.setItem('freshguard_user', JSON.stringify(data.user));
    return { token: data.token, user: data.user };
  },

  register: async (name: string, email: string, password: string): Promise<{ token: string; user: User }> => {
    const data = await apiRequest<{ success: boolean; token: string; user: User }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }
    );
    localStorage.setItem('freshguard_token', data.token);
    localStorage.setItem('freshguard_user', JSON.stringify(data.user));
    return { token: data.token, user: data.user };
  },

  logout: () => {
    localStorage.removeItem('freshguard_token');
    localStorage.removeItem('freshguard_user');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('freshguard_user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

// Product APIs
export const productAPI = {
  getAll: async (): Promise<Product[]> => {
    return apiRequest<Product[]>('/products');
  },

  getById: async (id: string): Promise<Product> => {
    return apiRequest<Product>(`/products/${id}`);
  },

  create: async (product: Omit<Product, 'id'>): Promise<Product> => {
    return apiRequest<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    return apiRequest<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  getExpired: async (): Promise<Product[]> => {
    return apiRequest<Product[]>('/products/expired');
  },

  getExpiringSoon: async (): Promise<Product[]> => {
    return apiRequest<Product[]>('/products/expiring-soon');
  },

  search: async (query: string): Promise<Product[]> => {
    return apiRequest<Product[]>(`/products/search?q=${encodeURIComponent(query)}`);
  },
};

// Barcode API
export const barcodeAPI = {
  lookup: async (barcode: string): Promise<{
    found: boolean;
    product?: {
      name: string;
      category: string;
      estimatedExpiryDate: string;
      daysToExpireEstimate: number;
    };
    message?: string;
  }> => {
    return apiRequest(`/barcode/lookup/${barcode}`);
  },
};

// Recipe API
export const recipeAPI = {
  suggest: async (): Promise<Recipe[]> => {
    return apiRequest<Recipe[]>('/recipes/suggest', {
      method: 'POST',
    });
  },
};

// Notification API
export const notificationAPI = {
  getAll: async (): Promise<Notification[]> => {
    return apiRequest<Notification[]>('/notifications');
  },
};

