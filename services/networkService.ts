import { CheckResult, ConnectivityStatus } from '../types';

const TIMEOUT_MS = 5000;

/**
 * Helper function to perform a single fetch request
 */
const fetchUrl = async (url: string, method: string = 'HEAD', timeout: number = TIMEOUT_MS): Promise<number> => {
  const start = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Add timestamp to bypass cache
  const cacheBuster = url.includes('?') ? `&_t=${Date.now()}` : `?_t=${Date.now()}`;
  const targetUrl = `${url}${cacheBuster}`;

  try {
    await fetch(targetUrl, {
      method,
      mode: 'no-cors',
      cache: 'no-store',
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
 * Strategy:
 * 1. Try HEAD request to root URL (Fastest, lightweight).
 * 2. If fails, Try GET request to /favicon.ico (Fallback, better compatibility).
 */
export const checkConnectivity = async (siteId: string, url: string): Promise<CheckResult> => {
  try {
    // Attempt 1: Standard Root Check (HEAD)
    const latency = await fetchUrl(url, 'HEAD', TIMEOUT_MS);
    return {
      siteId,
      status: ConnectivityStatus.SUCCESS,
      latency,
      timestamp: Date.now(),
    };
  } catch (error: any) {
    // If first attempt failed due to Abort (Timeout), return timeout immediately.
    // If it failed due to network error/CORS rejection, try fallback.
    
    // Construct Favicon URL for fallback
    let fallbackUrl = '';
    try {
      const urlObj = new URL(url);
      fallbackUrl = `${urlObj.origin}/favicon.ico`;
    } catch (e) {
      // If URL parsing fails, cannot do fallback
      return {
        siteId,
        status: ConnectivityStatus.ERROR,
        latency: 0,
        timestamp: Date.now(),
      };
    }

    try {
      // Attempt 2: Favicon Fallback (GET)
      // We give it a slightly shorter timeout for the fallback to keep UI snappy
      const latency = await fetchUrl(fallbackUrl, 'GET', 4000);
      return {
        siteId,
        status: ConnectivityStatus.SUCCESS,
        latency,
        timestamp: Date.now(),
      };
    } catch (fallbackError: any) {
      let status = ConnectivityStatus.ERROR;
      if (fallbackError.name === 'AbortError' || error.name === 'AbortError') {
        status = ConnectivityStatus.TIMEOUT;
      }

      return {
        siteId,
        status,
        latency: 0,
        timestamp: Date.now(),
      };
    }
  }
};