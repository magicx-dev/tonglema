
import { CheckResult, ConnectivityStatus, SiteConfig } from '../types';

const TIMEOUT_MS = 5000;

/**
 * Helper function to perform a single fetch request
 */
const fetchUrl = async (url: string, method: string = 'GET', timeout: number = TIMEOUT_MS): Promise<number> => {
  const start = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    await fetch(url, {
      method,
      mode: 'no-cors',
      // Use 'reload' to force network request without appending suspicious query params like ?_t=...
      cache: 'reload', 
      // Stealth options to reduce WAF blocking (403s)
      credentials: 'omit', 
      referrerPolicy: 'no-referrer',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const end = performance.now();
    return Math.round(end - start);
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

/**
 * Checks connectivity to a site.
 * Strategy (Updated):
 * 1. Try GET request to Custom Icon URL (if provided) OR /favicon.ico (Preferred: lighter, often whitelisted).
 * 2. If fails, Try GET request to root URL (Fallback). 
 */
export const checkConnectivity = async (site: SiteConfig): Promise<CheckResult> => {
  // Construct Favicon URL
  let targetIconUrl = site.iconUrl;

  // If no custom icon provided, try to guess standard favicon location
  if (!targetIconUrl) {
    try {
      const urlObj = new URL(site.url);
      targetIconUrl = `${urlObj.origin}/favicon.ico`;
    } catch (e) {
      targetIconUrl = site.url; 
    }
  }

  try {
    // Attempt 1: Favicon/Icon Check (GET)
    const latency = await fetchUrl(targetIconUrl, 'GET', 4000);
    return {
      siteId: site.id,
      status: ConnectivityStatus.SUCCESS,
      latency,
      timestamp: Date.now(),
    };
  } catch (error: any) {
    // If attempt 1 (Favicon) fails, try Attempt 2 (Root URL)
    
    try {
      // Attempt 2: Root URL Check (GET)
      // Using GET increases success rate against WAFs compared to HEAD
      const latency = await fetchUrl(site.url, 'GET', TIMEOUT_MS);
      return {
        siteId: site.id,
        status: ConnectivityStatus.SUCCESS,
        latency,
        timestamp: Date.now(),
      };
    } catch (fallbackError: any) {
      let status = ConnectivityStatus.ERROR;
      
      // Check if either error was a timeout
      if (error.name === 'AbortError' || fallbackError.name === 'AbortError') {
        status = ConnectivityStatus.TIMEOUT;
      }

      return {
        siteId: site.id,
        status,
        latency: 0,
        timestamp: Date.now(),
      };
    }
  }
};
