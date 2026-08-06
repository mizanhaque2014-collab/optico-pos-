// OPTICO POS - Dynamic API Endpoint Configuration
// Allows multi-tenant customers to run on their own Apps Script Backend via local storage overrides.

const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbw279jQdZtQPJEzDFxb1oC59Xn6OALuo6f8Z_I5IGaCsOz5Vu_vuP0HZis1yghgVeRc-g/exec';

function getCleanApiUrl() {
  if (typeof window === 'undefined') return DEFAULT_API_URL;
  let url = localStorage.getItem('opt_api_url') || '';
  
  // Clean up any stray quotes, semicolons, or whitespace that might have been accidentally saved
  try { url = decodeURIComponent(url); } catch (e) {}
  url = url.replace(/["';\s]/g, ''); // Remove all quotes, semicolons, and whitespace
  url = url.trim();
  url = url.replace(/\/+$/, ''); // Remove trailing slashes
  
  // Fix cases where https:// got mangled to https:/
  if (url.startsWith('https:/') && !url.startsWith('https://')) {
    url = url.replace('https:/', 'https://');
  }
  
  return url || DEFAULT_API_URL;
}

export const API_URL = getCleanApiUrl();

// Helper to save a custom API URL
export function saveApiUrl(url: string) {
  if (typeof window !== 'undefined') {
    if (url && url.trim()) {
      let cleanUrl = url.trim();
      try { cleanUrl = decodeURIComponent(cleanUrl); } catch (e) {}
      cleanUrl = cleanUrl.replace(/["';\s]/g, ''); // Remove all quotes, semicolons, and whitespace
      cleanUrl = cleanUrl.replace(/\/+$/, '');
      if (cleanUrl.startsWith('https:/') && !cleanUrl.startsWith('https://')) {
        cleanUrl = cleanUrl.replace('https:/', 'https://');
      }
      localStorage.setItem('opt_api_url', cleanUrl);
    } else {
      localStorage.removeItem('opt_api_url');
    }
    // Refresh to apply across services
    window.location.reload();
  }
}
