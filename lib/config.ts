// OPTICO POS - Dynamic API Endpoint Configuration
// Allows multi-tenant customers to run on their own Apps Script Backend via local storage overrides.

const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbwMpyF1V9imrg4yUhnhqaPy6KzKD2ZTzQu918dnnAgSnn49S4PpLFvzRJzbwYO-WM8tNA/exec';


function getCleanApiUrl() {
  return DEFAULT_API_URL;
}


export const API_URL = getCleanApiUrl();

// Helper to save a custom API URL
export function saveApiUrl(url: string) {
  if (typeof window !== 'undefined') {
    if (url && url.trim()) {
      let cleanUrl = url.trim();
      try { cleanUrl = decodeURIComponent(cleanUrl); } catch (e) {}
      cleanUrl = cleanUrl.replace(/["';\s]/g, ''); // Remove all quotes, semicolons, and whitespace
      cleanUrl = cleanUrl.replace(/%22/g, ''); // Remove %22
      cleanUrl = cleanUrl.replace(/\/+$/, '');
      
      cleanUrl = cleanUrl.replace('script.googleusercontent.com', 'script.google.com');
      
      if (cleanUrl.endsWith('/dev')) {
        cleanUrl = cleanUrl.substring(0, cleanUrl.length - 4) + '/exec';
      }
      
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
