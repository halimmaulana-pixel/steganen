import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface EmbedRequest {
  cover_image: string;
  secret_message: string;
  threshold_percent: number;
}

export interface EmbedResponse {
  success: boolean;
  data: {
    stego_image: string;
    metrics: {
      psnr_db: number;
      ssim: number;
      mse: number;
    };
    metadata: Record<string, unknown>;
  };
}

export interface ExtractRequest {
  stego_image: string;
  metadata: {
    message_length_bits: number;
    threshold_percent: number;
  };
}

export interface ExtractResponse {
  success: boolean;
  data: {
    message: string;
    bit_count: number;
  };
}

export interface AnalyzeRequest {
  cover_image: string;
  threshold_percent: number;
}

export interface AnalyzeResponse {
  success: boolean;
  data: {
    coefficient_stats: {
      mean: number;
      std: number;
      min: number;
      max: number;
      median: number;
      skewness: number;
      kurtosis: number;
      entropy: number;
    };
    pixel_analysis: {
      texture_ratio: number;
      smooth_ratio: number;
      selected_pixels_texture: number;
      selected_pixels_smooth: number;
      total_selected: number;
      texture_selection_percent: number;
    };
    explanations: {
      coefficient_distribution: string;
      pixel_selection: string;
      threshold_methodology: string;
    };
    threshold_sweep: {
      threshold: number;
      selected_pixels: number;
      selection_ratio: number;
      texture_percent: number;
    }[];
  };
}

export interface DashboardStatsData {
  total_processes: number;
  avg_psnr: number;
  avg_ssim: number;
  total_payload_bits: number;
  avg_usage_percent: number;
  embed_ratio: number;
  by_type: Record<string, number>;
}

export interface HistoryEntry {
  id: number;
  created_at: string;
  process_type: string;
  image_name: string;
  threshold_percent: number;
  psnr_db: number | null;
  ssim: number | null;
  mse: number | null;
  message_length_chars: number;
  message_length_bits: number;
  selected_pixels: number;
  total_pixels: number;
  capacity_bits: number;
  usage_percent: number;
}

export interface HistoryResponse {
  success: boolean;
  data: HistoryEntry[];
  total: number;
}

export interface HealthResponse {
  status: string;
  version: string;
  uptime: number;
}

const client = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'Terjadi kesalahan';
    return Promise.reject(new Error(message));
  }
);

export const api = {
  embed: async (data: EmbedRequest) => {
    const response = await client.post<EmbedResponse>('/api/v1/embed', data);
    return response.data;
  },

  extract: async (data: ExtractRequest) => {
    const response = await client.post<ExtractResponse>('/api/v1/extract', data);
    return response.data;
  },

  evaluate: async (data: EvaluateRequest) => {
    const response = await client.post<EvaluateResponse>('/api/v1/evaluate', data);
    return response.data;
  },

  analyze: async (data: AnalyzeRequest) => {
    const response = await client.post<AnalyzeResponse>('/api/v1/analyze', data);
    return response.data;
  },

  getHistory: async (params?: { limit?: number; offset?: number; process_type?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    if (params?.process_type) searchParams.set('process_type', params.process_type);
    const query = searchParams.toString();
    const response = await client.get<HistoryResponse>(`/api/v1/history${query ? '?' + query : ''}`);
    return response.data;
  },

  getStats: async () => {
    const response = await client.get<{ success: boolean; data: DashboardStatsData }>('/api/v1/stats');
    return response.data;
  },

  getHistoryDetail: async (id: number) => {
    const response = await client.get<{ success: boolean; data: HistoryEntry }>(`/api/v1/history/${id}`);
    return response.data;
  },

  healthCheck: async () => {
    const response = await client.get<HealthResponse>('/api/v1/health');
    return response.data;
  },
};

export default api;
