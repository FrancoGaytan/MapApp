// Configuration file for API endpoints
export const API_CONFIG = {
  // Production server deployed to Vercel
  BASE_URL: 'https://server-mocha-nu.vercel.app',
  ENDPOINTS: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    FIELDS: '/fields',
  },
};

// Helper function to build full URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};