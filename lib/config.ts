// OPTICO POS - Dynamic API Endpoint Configuration
// Allows multi-tenant customers to run on their own Apps Script Backend via local storage overrides.

const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbw279jQdZtQPJEzDFxb1oC59Xn6OALuo6f8Z_I5IGaCsOz5Vu_vuP0HZis1yghgVeRc-g/exec';

export const API_URL = typeof window !== 'undefined'
  ? (localStorage.getItem('opt_api_url') || DEFAULT_API_URL)
  : DEFAULT_API_URL;

// Helper to save a custom API URL
export function saveApiUrl(url: string) {
  if (typeof window !== 'undefined') {
    if (url && url.trim()) {
      localStorage.setItem('opt_api_url', url.trim());
    } else {
      localStorage.removeItem('opt_api_url');
    }
    // Refresh to apply across services
    window.location.reload();
  }
}
