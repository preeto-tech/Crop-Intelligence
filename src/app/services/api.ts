// API Service for Crop Intelligence Platform
const API_BASE_URL = 'https://cors-anywhere-d4lv.onrender.com/https://asking-saved-dim-trial.trycloudflare.com/api';

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'farmer' | 'admin';
  token?: string;
}

export interface Crop {
  id: number;
  name: string;
  nameHi: string;
  season: string;
  soil: string;
  irrigation: string;
  fertilizer: string;
  pests: string;
  image: string;
  color: string;
}

export interface Reply {
  _id?: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface Post {
  _id?: string;
  id?: string;
  title: string;
  body: string;
  author: string;
  authorId?: string;
  replies?: Reply[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MandiData {
  crops: string[];
  districts: string[];
  priceTable: Record<string, Record<string, number>>;
  trends: Record<string, number[]>;
  months: string[];
}

export interface WeatherData {
  city: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
}

export interface TransportRequest {
  farmerName: string;
  crop: string;
  quantity: string;
  pickupLocation: string;
  phone: string;
  preferredDate: string;
}

// Authentication
export const authAPI = {
  signup: async (data: { name: string; email: string; password: string; role?: 'farmer' | 'admin' }): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Signup failed');
    return response.json();
  },

  login: async (data: { email: string; password: string }): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },
};

// Crops
export const cropsAPI = {
  getAll: async (filters?: { search?: string; season?: string }): Promise<Crop[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.season) params.append('season', filters.season);

    const response = await fetch(`${API_BASE_URL}/crops?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch crops');
    return response.json();
  },
};

// Community Forum
export const communityAPI = {
  getPosts: async (): Promise<Post[]> => {
    const response = await fetch(`${API_BASE_URL}/posts`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },

  createPost: async (data: { title: string; body: string; author: string }): Promise<Post> => {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create post');
    return response.json();
  },
};

// Mandi Prices
export const mandiAPI = {
  getData: async (): Promise<MandiData> => {
    const response = await fetch(`${API_BASE_URL}/mandi`);
    if (!response.ok) throw new Error('Failed to fetch mandi data');
    return response.json();
  },
};

// Transport
export const transportAPI = {
  bookTransport: async (data: TransportRequest): Promise<{ message: string; request: any }> => {
    const response = await fetch(`${API_BASE_URL}/transport/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to book transport');
    return response.json();
  },
};

// Weather
export const weatherAPI = {
  getCurrent: async (city: string): Promise<WeatherData> => {
    const response = await fetch(`${API_BASE_URL}/weather?city=${encodeURIComponent(city)}`);
    if (!response.ok) throw new Error('Failed to fetch weather');
    return response.json();
  },
};
