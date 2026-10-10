export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  TIMEOUT_MS: 120000,
  USE_MOCK_FALLBACK: false
};

export async function apiRequest(endpoint, options = {}) {
  const {
    timeoutMs = API_CONFIG.TIMEOUT_MS,
    timeoutMessage,
    ...requestOptions
  } = options;
  const url = `${API_CONFIG.BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  const config = {
    ...requestOptions,
    headers,
    credentials: 'include' // Crucial for HTTP-only cookies (refresh token)
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  config.signal = controller.signal;

  try {
    const response = await fetch(url, config);

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || `HTTP Error ${response.status}`;
      throw new Error(errorMsg);
    }

    // Backend standardized on { success, data, message }
    return data?.data !== undefined ? data.data : data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(timeoutMessage || `Request timed out after ${Math.ceil(timeoutMs / 1000)} seconds.`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
