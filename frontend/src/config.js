// API Configuration
// For local development, use localhost
// For production, use your deployed backend URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper function for making API calls
export const apiUrl = (path) => `${API_BASE_URL}${path}`;
