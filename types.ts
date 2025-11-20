
export type Language = 'en' | 'zh';

export interface SiteConfig {
  id: string;
  name: string;
  name_zh?: string; // Chinese name
  url: string;
  iconUrl?: string; // Custom URL for favicon/icon detection and display
  category: 'Search' | 'Social' | 'AI' | 'Media' | 'Dev' | 'Other';
  description?: string;
  description_zh?: string; // Chinese description
}

export enum ConnectivityStatus {
  IDLE = 'IDLE',
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  TIMEOUT = 'TIMEOUT',
}

export interface CheckResult {
  siteId: string;
  status: ConnectivityStatus;
  latency: number; // in milliseconds
  timestamp: number;
}

export type CheckResultMap = Record<string, CheckResult>;
