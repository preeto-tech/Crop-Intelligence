// API Service for Crop Intelligence Platform
const API_BASE_URL = 'http://localhost:5001/api';

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'farmer' | 'expert' | 'admin' | 'transporter' | 'buyer';
  location?: string;
  phone?: string;
  token?: string;
}

export interface CommunityQA {
  question: string;
  answer: string;
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
  bestPractices?: string[];
  communityQA?: CommunityQA[];
  storage?: string;
  marketDynamics?: string;
}

export interface CropsResponse {
  total: number;
  crops: Crop[];
}

export interface Reply {
  _id?: string;
  author: string;
  body: string;
  isExpert?: boolean;
  createdAt: string;
}

export interface Post {
  _id?: string;
  id?: string;
  title: string;
  body: string;
  author: string;
  authorId?: string;
  authorLocation?: string;
  category?: string;
  tags?: string[];
  image?: string;
  upvotes?: number;
  views?: number;
  answers?: Reply[];
  answered?: boolean;
  expertAnswered?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgmarknetRecord {
  trend: string;
  cmdt_name: string;
  msp_price: string;
  as_on_price: string;
  as_on_arrival: string;
  cmdt_grp_name: string;
  reported_date: string;
  one_day_ago_price: string;
  two_day_ago_price: string | null;
  one_day_ago_arrival: string;
  two_day_ago_arrival: string | null;
}

export interface MandiData {
  status: string;
  message: string;
  pagination: {
    total_count: number;
    total_pages: number;
    current_page: number;
    next_page: string | null;
    previous_page: string | null;
    items_per_page: number;
  };
  data: {
    columns: any[];
    records: AgmarknetRecord[];
    count: any;
  };
}

export interface WeatherData {
  city: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  visibility?: number;
  feels_like?: number;
  temp_min?: number;
  temp_max?: number;
  sunrise?: number;
  sunset?: number;
}

export interface TransportRequest {
  farmerName: string;
  crop: string;
  quantity: string;
  pickupLocation: string;
  phone: string;
  preferredDate: string;
}

// Token helper – reads the JWT stored by the login flow (App.tsx stores it under 'token')
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Authentication
export const authAPI = {
  signup: async (data: { name: string; email: string; password: string; role?: 'farmer' | 'admin' | 'transporter' | 'buyer'; location?: string; phone?: string }): Promise<User> => {
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
    const data: CropsResponse = await response.json();
    return data.crops;
  },

  getById: async (id: number): Promise<Crop> => {
    const response = await fetch(`${API_BASE_URL}/crops/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch crop #${id}`);
    return response.json();
  },
};

export interface CommunityResponse {
  total: number;
  page: number;
  posts: Post[];
}

// Community Forum
export const communityAPI = {
  getPosts: async (filters?: { category?: string; tag?: string; search?: string }): Promise<CommunityResponse> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.tag) params.append('tag', filters.tag);
    if (filters?.search) params.append('search', filters.search);

    const response = await fetch(`${API_BASE_URL}/posts?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return response.json();
  },

  getById: async (id: string): Promise<Post> => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`);
    if (!response.ok) throw new Error('Failed to fetch post');
    return response.json();
  },

  createPost: async (data: {
    title: string;
    body: string;
    category?: string;
    tags?: string[];
    image?: string;
    cropId?: number;
    cropName?: string;
  }): Promise<Post> => {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create post');
    return response.json();
  },

  upvotePost: async (id: string): Promise<{ upvotes: number; voted: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}/upvote`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to upvote post');
    return response.json();
  },

  addAnswer: async (postId: string, body: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ body }),
    });
    if (!response.ok) throw new Error('Failed to add answer');
    return response.json();
  },
};

// Mandi Prices
export const mandiAPI = {
  getFilters: async () => {
    const response = await fetch(`${API_BASE_URL}/mandi/filters`);
    if (!response.ok) throw new Error('Failed to fetch mandi filters');
    return response.json();
  },

  getData: async (page: number = 1, limit: number = 30, stateId?: number | null): Promise<MandiData> => {
    const stateParam = stateId ? `&stateId=${stateId}` : '';
    const response = await fetch(`${API_BASE_URL}/mandi?page=${page}&limit=${limit}${stateParam}`);
    if (!response.ok) throw new Error('Failed to fetch mandi data');
    return response.json();
  },
};

// Vehicle Management
export interface Vehicle {
  _id?: string;
  type: string;
  vehicleNumber: string;
  capacity: string;
  currentLocation?: string;
  availableTime?: string;
}

export const vehicleAPI = {
  add: async (data: Vehicle): Promise<Vehicle> => {
    const response = await fetch(`${API_BASE_URL}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add vehicle');
    return response.json();
  },

  getMyVehicles: async (): Promise<Vehicle[]> => {
    const response = await fetch(`${API_BASE_URL}/vehicles/my`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch vehicles');
    return response.json();
  },

  delete: async (id: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete vehicle');
    return response.json();
  },
};

// Transport
export const transportAPI = {
  bookTransport: async (data: TransportRequest): Promise<{ message: string; request: any }> => {
    const response = await fetch(`${API_BASE_URL}/transport/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to book transport');
    return response.json();
  },

  getMyRequests: async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/transport/my`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch my requests');
    return response.json();
  },

  getNearbyVehicles: async (location?: string): Promise<Vehicle[]> => {
    const locParam = location ? `?location=${location}` : '';
    const response = await fetch(`${API_BASE_URL}/transport/nearby${locParam}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch nearby vehicles');
    return response.json();
  },

  getAllRequests: async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/transport/all`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch requests');
    return response.json();
  },

  acceptRequest: async (id: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/transport/${id}/accept`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to accept request');
    }
    return response.json();
  },

  rejectRequest: async (id: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/transport/${id}/reject`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to reject request');
    return response.json();
  },
};

// Chat
export interface ChatMessage {
  id?: string;
  requestId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export const chatAPI = {
  getHistory: async (requestId: string): Promise<ChatMessage[]> => {
    const response = await fetch(`${API_BASE_URL}/chat/${requestId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch chat history');
    return response.json();
  },
  saveMessage: async (data: ChatMessage): Promise<ChatMessage> => {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to save chat message');
    return response.json();
  }
};

// Expert Services
export const expertAPI = {
  getAIAdvice: async (data: { question: string; crop?: string; location?: string }): Promise<{ advice: string }> => {
    const response = await fetch(`${API_BASE_URL}/expert/advise`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to get AI advice');
    return response.json();
  },
};

// Weather
export const weatherAPI = {
  getCurrent: async (params: { city?: string; lat?: number; lon?: number }): Promise<WeatherData> => {
    const query = params.city
      ? `city=${encodeURIComponent(params.city)}`
      : `lat=${params.lat}&lon=${params.lon}`;
    const response = await fetch(`${API_BASE_URL}/weather?${query}`);
    if (!response.ok) throw new Error('Failed to fetch weather');
    return response.json();
  },
};

// AI Services
export const aiAPI = {
  parseSellIntent: async (prompt: string): Promise<{ crop: string | null, quantity: string | null, location: string | null }> => {
    const response = await fetch(`${API_BASE_URL}/ai/parse-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ prompt }),
    });
    if (!response.ok) throw new Error('Failed to parse AI intent');
    return response.json();
  }
};

// Market Services
export interface MarketListing {
  id?: string;
  farmerId?: string;
  farmerName?: string;
  crop: string;
  quantity: string;
  location: string;
  price?: number | null;
  isAIGenerated?: boolean;
  status?: string;
  createdAt?: string;
}

export const marketAPI = {
  sellCrop: async (data: MarketListing): Promise<MarketListing> => {
    const response = await fetch(`${API_BASE_URL}/market/sell`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create market listing');
    return response.json();
  },
  getMyListings: async (): Promise<MarketListing[]> => {
    const response = await fetch(`${API_BASE_URL}/market/my-listings`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch my listings');
    return response.json();
  },
  getAllActiveListings: async (): Promise<MarketListing[]> => {
    const response = await fetch(`${API_BASE_URL}/market/all`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch active market listings');
    return response.json();
  },
  initiateOrder: async (listingId: string): Promise<MarketOrder> => {
    const response = await fetch(`${API_BASE_URL}/market/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ listingId }),
    });
    if (!response.ok) throw new Error('Failed to initiate order');
    return response.json();
  },
  getMyOrders: async (): Promise<MarketOrder[]> => {
    const response = await fetch(`${API_BASE_URL}/market/my-orders`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch buyer orders');
    return response.json();
  },
  getFarmerOrders: async (): Promise<MarketOrder[]> => {
    const response = await fetch(`${API_BASE_URL}/market/farmer-orders`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch farmer orders');
    return response.json();
  }
};

export interface MarketOrder {
  id?: string;
  listingId: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  crop: string;
  quantity: string;
  price?: number | null;
  status: string;
  createdAt?: string;
}
