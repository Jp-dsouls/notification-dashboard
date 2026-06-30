import axios, { type AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const correlationId = uuidv4();
  config.headers['X-Correlation-ID'] = correlationId;

  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'INFO',
    service: 'dashboard-ui',
    context: 'apiClient.request',
    correlationId,
    method: config.method?.toUpperCase(),
    url: config.url,
    message: 'API request sent',
  }));

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const correlationId = response.config.headers['X-Correlation-ID'] as string;

    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      service: 'dashboard-ui',
      context: 'apiClient.response',
      correlationId,
      status: response.status,
      url: response.config.url,
      message: 'API response received',
    }));

    return response;
  },
  (error: AxiosError) => {
    const correlationId = error.config?.headers?.['X-Correlation-ID'] as string || 'N/A';

    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      service: 'dashboard-ui',
      context: 'apiClient.error',
      correlationId,
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
    }));

    return Promise.reject(error);
  },
);

export interface Product {
  id: string;
  name: string;
  apiKey: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Channel {
  id: string;
  name: string;
  configSchema: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductChannel {
  id: string;
  productId: string;
  channelId: string;
  isEnabled: boolean;
  channel: Channel;
}

export interface Template {
  id: string;
  productId: string;
  channelId: string;
  name: string;
  body: string;
  product: { name: string };
  channel: { name: string };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const api = {
  products: {
    list: (page = 1, limit = 10) =>
      apiClient.get<PaginatedResponse<Product>>('/products', { params: { page, limit } }),
    create: (name: string) =>
      apiClient.post<Product>('/products', { name }),
    updateStatus: (id: string, status: boolean) =>
      apiClient.put<Product>(`/products/${id}/status`, { status }),
    getChannels: (productId: string) =>
      apiClient.get<ProductChannel[]>(`/products/${productId}/channels`),
    assignChannel: (productId: string, channelId: string, isEnabled = true) =>
      apiClient.post<ProductChannel>(`/products/${productId}/channels/${channelId}`, { isEnabled }),
    removeChannel: (productId: string, channelId: string) =>
      apiClient.delete(`/products/${productId}/channels/${channelId}`),
    updateChannelStatus: (productId: string, channelId: string, isEnabled: boolean) =>
      apiClient.put<ProductChannel>(`/products/${productId}/channels/${channelId}`, { isEnabled }),
  },
  channels: {
    list: () =>
      apiClient.get<Channel[]>('/channels'),
    create: (name: string, configSchema: Record<string, unknown>) =>
      apiClient.post<Channel>('/channels', { name, configSchema }),
    update: (id: string, configSchema: Record<string, unknown>) =>
      apiClient.put<Channel>(`/channels/${id}`, { configSchema }),
  },
  templates: {
    list: (productId?: string, channelId?: string) =>
      apiClient.get<Template[]>('/templates', { params: { product_id: productId, channel_id: channelId } }),
    create: (productId: string, channelId: string, name: string, body: string) =>
      apiClient.post<Template>('/templates', { productId, channelId, name, body }),
    update: (id: string, name?: string, body?: string) =>
      apiClient.put<Template>(`/templates/${id}`, { name, body }),
    delete: (id: string) =>
      apiClient.delete(`/templates/${id}`),
  },
};

export { apiClient };
