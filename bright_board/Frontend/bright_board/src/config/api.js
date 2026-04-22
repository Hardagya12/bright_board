/**
 * API Configuration
 * Automatically switches between local and production API URLs
 * based on the environment
 */

const getApiBaseUrl = () => {
  // In development mode, use localhost
  if (import.meta.env.DEV) {
    return "http://localhost:3000";
  }

  // In production mode, use the deployed backend
  return "https://bb-t5a0.onrender.com";
};

export const API_BASE_URL = getApiBaseUrl();

// Export helper function for making API calls with the base URL
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};
