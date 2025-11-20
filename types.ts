import { LucideIcon } from 'lucide-react';

export interface SiteConfig {
  id: string;
  name: string;
  url: string; // The URL to ping (usually the homepage or a highly available asset)
  icon: LucideIcon;
  category: 'Search' | 'Social' | 'AI' | 'Media' | 'Dev' | 'Other';
  description?: string;
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