// API Configuration
// For local development, use localhost
// For production, use your deployed backend URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper function for making API calls
export const apiUrl = (path) => `${API_BASE_URL}${path}`;

// Debug: Log the API URL being used (will show in browser console)
console.log('🔧 API Configuration Loaded');
console.log('🌐 VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('🎯 API_BASE_URL:', API_BASE_URL);
console.log('📍 Mode:', import.meta.env.MODE);

// Verify API is accessible (only in browser)
if (typeof window !== 'undefined') {
  fetch(apiUrl('/api/mm/areas'))
    .then(response => {
      if (response.ok) {
        console.log('✅ API Connection: SUCCESS');
      } else {
        console.error('❌ API Connection: FAILED -', response.status, response.statusText);
        console.error('🔗 Attempted URL:', apiUrl('/api/mm/areas'));
      }
    })
    .catch(error => {
      console.error('❌ API Connection: ERROR -', error.message);
      console.error('🔗 Attempted URL:', apiUrl('/api/mm/areas'));
      console.error('💡 Check: 1) Backend deployed? 2) VITE_API_URL set? 3) CORS enabled?');
    });
}
