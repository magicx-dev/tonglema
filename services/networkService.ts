
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
      // 'reload' helps bypass local cache to ensure real network check.
      // 'no-store' might be even stronger but 'reload' is sufficient for connectivity.
      cache: 'reload', 
      // Stealth options to reduce WAF blocking (403s) and CORP issues where possible
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
 * 1. Try GET request to Root URL (Preferred: represents actual site availability).
 * 2. If fails, Try GET request to Custom Icon URL or /favicon.ico (Fallback: often different CDN/rules).
 */
export const checkConnectivity = async (site: SiteConfig): Promise<CheckResult> => {
  // Construct Favicon URL for fallback
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
    // Attempt 1: Root URL Check (GET)
    const latency = await fetchUrl(site.url, 'GET', TIMEOUT_MS);
    return {
      siteId: site.id,
      status: ConnectivityStatus.SUCCESS,
      latency,
      timestamp: Date.now(),
    };
  } catch (error: any) {
    // If attempt 1 (Root URL) fails, try Attempt 2 (Favicon)
    
    try {
      // Attempt 2: Favicon/Icon Check (GET)
      const latency = await fetchUrl(targetIconUrl, 'GET', 3500);
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
