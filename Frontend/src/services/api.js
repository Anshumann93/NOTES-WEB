/**
 * ==========================================================================
 * 🌟 BACKEND CONNECTION POINT: BASE API CLIENT
 * ==========================================================================
 * This module manages all network communications with the TubeShell backend.
 * 
 * TO CONNECT YOUR BACKEND:
 * 1. Create a `.env` file in the Frontend root.
 * 2. Set: `VITE_API_BASE_URL=http://your-backend-host:port/api`
 * 3. Toggle `USE_MOCK_FALLBACK = false` below once your backend server is live.
 * ==========================================================================
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  TIMEOUT_MS: 30000,
  USE_MOCK_FALLBACK: true // Set to false when your real backend is fully running
};

/**
 * Universal API Request Wrapper with error handling & token auth support
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_CONFIG.BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  // Optional: Attach Auth Token if exists in localStorage
  const token = localStorage.getItem('tubeshell_auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);
    config.signal = controller.signal;

    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `HTTP Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // If real backend is offline and fallback is enabled, pass through for mock handling
    if (API_CONFIG.USE_MOCK_FALLBACK) {
      console.warn(`[TubeShell API] Real backend offline (${url}). Using intelligent client fallback.`, error.message);
      return null; // Signals services to use client generator / localStorage
    }
    throw error;
  }
}
