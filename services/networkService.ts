import { CheckResult, ConnectivityStatus } from '../types';

const TIMEOUT_MS = 5000;

/**
 * Checks connectivity to a specific URL.
 * 
 * NOTE: We use mode: 'no-cors'. This means we cannot read the status code (200 vs 404 vs 500).
 * However, if the promise resolves, it means we successfully established a connection and got *some* response.
 * If it rejects, it's usually a network error (DNS failure, blocked connection, timeout).
 */
export const checkConnectivity = async (siteId: string, url: string): Promise<CheckResult> => {
  const start = performance.now();
  
  // Add a timestamp to bypass browser caching
  const cacheBuster = url.includes('?') ? `&_t=${Date.now()}` : `?_t=${Date.now()}`;
  const targetUrl = `${url}${cacheBuster}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    await fetch(targetUrl, {
      method: 'HEAD', // Try HEAD first to be lighter, though some servers reject it.
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const end = performance.now();
    const latency = Math.round(end - start);

    return {
      siteId,
      status: ConnectivityStatus.SUCCESS,
      latency,
      timestamp: Date.now(),
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    let status = ConnectivityStatus.ERROR;
    if (error.name === 'AbortError') {
      status = ConnectivityStatus.TIMEOUT;
    }

    return {
      siteId,
      status,
      latency: 0,
      timestamp: Date.now(),
    };
  }
};