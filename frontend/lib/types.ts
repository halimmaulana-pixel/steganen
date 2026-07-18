export interface Metrics {
  psnr_db: number;
  ssim: number;
  mse: number;
  psnr_r_db?: number;
  psnr_g_db?: number;
  psnr_b_db?: number;
  changed_pixels?: number;
  total_pixels?: number;
  change_ratio?: number;
  max_pixel_difference?: number;
  mean_pixel_difference?: number;
  histogram_distance?: number;
  difference_histogram?: {
    bins: string[];
    counts: number[];
  };
}

export interface ProcessHistory {
  id: number;
  process_type: string;
  image_name: string;
  threshold_percent: number;
  psnr_db: number;
  ssim: number;
  created_at: string;
}

export interface ExportData {
  type: 'csv' | 'pdf' | 'json';
  data: Record<string, unknown>[];
}

export interface ComparisonData {
  lsb_standar: {
    stego_image: string;
    metrics: Metrics;
  };
  lsb_cnn: {
    stego_image: string;
    metrics: Metrics;
  };
  comparison: {
    psnr_diff_db: number;
    ssim_diff: number;
    mse_diff: number;
    better_method: string;
  };
  original_image: string;
}

export type TabId = 'visual' | 'metrics' | 'charts';
export type AnalyzeTabId = 'threshold' | 'coefficients' | 'pixels' | 'export';

export interface AnalyzeResponse {
  success: boolean;
  data: {
    coefficient_distribution: Record<string, unknown>;
    pixel_analysis: Record<string, unknown>;
    threshold_sweep: Record<string, unknown>;
    theoretical_explanation: Record<string, unknown>;
  };
}
