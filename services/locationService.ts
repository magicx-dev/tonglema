/**
 * IP Location Detection Service
 * 使用免费的 IP 地理位置 API 来检测访问者的位置
 */

import { LocationInfo } from '../types';

/**
 * 解析 Cloudflare trace 文本格式
 */
const parseCloudflareTrace = (text: string): LocationInfo | null => {
  const lines = text.trim().split('\n');
  const data: Record<string, string> = {};
  
  for (const line of lines) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      data[key.trim()] = valueParts.join('=').trim();
    }
  }
  
  if (!data.ip || !data.loc) {
    return null;
  }
  
  // 国家代码到国家名称的映射（常见国家）
  // 如果不在映射中，则使用国家代码作为显示名称
  const countryMap: Record<string, string> = {
    'US': 'United States', 'CN': 'China', 'JP': 'Japan', 'GB': 'United Kingdom',
    'DE': 'Germany', 'FR': 'France', 'CA': 'Canada', 'AU': 'Australia',
    'KR': 'South Korea', 'IN': 'India', 'BR': 'Brazil', 'RU': 'Russia',
    'IT': 'Italy', 'ES': 'Spain', 'MX': 'Mexico', 'NL': 'Netherlands',
    'SE': 'Sweden', 'NO': 'Norway', 'DK': 'Denmark', 'FI': 'Finland',
    'PL': 'Poland', 'TR': 'Turkey', 'SA': 'Saudi Arabia', 'AE': 'United Arab Emirates',
    'SG': 'Singapore', 'HK': 'Hong Kong', 'TW': 'Taiwan', 'MY': 'Malaysia',
    'TH': 'Thailand', 'ID': 'Indonesia', 'PH': 'Philippines', 'VN': 'Vietnam',
    'NZ': 'New Zealand', 'CH': 'Switzerland', 'AT': 'Austria', 'BE': 'Belgium',
    'PT': 'Portugal', 'GR': 'Greece', 'IE': 'Ireland', 'IL': 'Israel',
    'ZA': 'South Africa', 'EG': 'Egypt', 'AR': 'Argentina', 'CL': 'Chile',
    'CO': 'Colombia', 'PE': 'Peru', 'VE': 'Venezuela', 'PK': 'Pakistan',
    'BD': 'Bangladesh', 'MM': 'Myanmar', 'KH': 'Cambodia', 'LA': 'Laos',
  };
  
  return {
    ip: data.ip,
    country: countryMap[data.loc] || data.loc,
    countryCode: data.loc,
    region: data.colo || undefined, // 使用 Cloudflare 数据中心代码作为地区信息
    city: undefined,
    isp: undefined,
    latitude: undefined,
    longitude: undefined,
    timezone: undefined,
  };
};

/**
 * 检测访问者的 IP 位置信息
 * 使用多个备用 API 以确保可靠性
 */
export const detectLocation = async (): Promise<LocationInfo | null> => {
  // 尝试多个免费的 IP 地理位置 API
  const apis = [
    // API 0: Cloudflare Trace (最快，最可靠，但信息较少)
    async (): Promise<LocationInfo | null> => {
      try {
        const response = await fetch('https://cloudflare.com/cdn-cgi/trace', {
          method: 'GET',
          headers: {
            'Accept': 'text/plain',
          },
        });
        if (!response.ok) throw new Error('API error');
        const text = await response.text();
        return parseCloudflareTrace(text);
      } catch {
        return null;
      }
    },
    
    // API 1: ipapi.co (免费，无需 API key)
    async (): Promise<LocationInfo | null> => {
      try {
        const response = await fetch('https://ipapi.co/json/', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        if (!response.ok) throw new Error('API error');
        const data = await response.json();
        return {
          ip: data.ip || '',
          country: data.country_name || '',
          countryCode: data.country_code || '',
          region: data.region || '',
          city: data.city || '',
          isp: data.org || '',
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone || '',
        };
      } catch {
        return null;
      }
    },
    
    // API 2: ip-api.com (免费，无需 API key)
    async (): Promise<LocationInfo | null> => {
      try {
        const response = await fetch('http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,isp,query,lat,lon,timezone', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        if (!response.ok) throw new Error('API error');
        const data = await response.json();
        if (data.status === 'fail') throw new Error(data.message);
        return {
          ip: data.query || '',
          country: data.country || '',
          countryCode: data.countryCode || '',
          region: data.regionName || data.region || '',
          city: data.city || '',
          isp: data.isp || '',
          latitude: data.lat,
          longitude: data.lon,
          timezone: data.timezone || '',
        };
      } catch {
        return null;
      }
    },
    
    // API 3: ipwho.is (免费，无需 API key)
    async (): Promise<LocationInfo | null> => {
      try {
        const response = await fetch('https://ipwho.is/', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        if (!response.ok) throw new Error('API error');
        const data = await response.json();
        if (!data.success) throw new Error('API returned error');
        return {
          ip: data.ip || '',
          country: data.country || '',
          countryCode: data.country_code || '',
          region: data.region || '',
          city: data.city || '',
          isp: data.isp || '',
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone?.id || data.timezone || '',
        };
      } catch {
        return null;
      }
    },
  ];

  // 依次尝试每个 API，直到成功
  for (const api of apis) {
    try {
      const result = await api();
      if (result) {
        return result;
      }
    } catch {
      // 继续尝试下一个 API
      continue;
    }
  }

  return null;
};

