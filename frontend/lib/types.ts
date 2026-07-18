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

export interface AnalyzeData {
  threshold_sweep: Array<{
    threshold: number;
    selected_pixels: number;
    selection_ratio: number;
    texture_percent: number;
  }>;
  coefficient_stats: {
    min: number;
    max: number;
    mean: number;
    std: number;
    median: number;
    skewness: number;
    kurtosis: number;
    entropy: number;
  };
  coefficient_distribution: Record<string, unknown>;
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
}
