// OPTICO POS - Dynamic API Endpoint Configuration
// Allows multi-tenant customers to run on their own Apps Script Backend via local storage overrides.

const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbyNn9b0CIgLFIjPXJn4MY4dc_4ZqqghLLscQrEvuO_iQSuwY2xiu1i2hQ24tAsbLVyW9g/exec';

function getCleanApiUrl() {
  if (typeof window === 'undefined') return DEFAULT_API_URL;
  let url = localStorage.getItem('opt_api_url') || DEFAULT_API_URL;
  
  // Clean up any stray quotes, semicolons, or whitespace that might have been accidentally saved
  try { url = decodeURIComponent(url); } catch (e) {}
  url = url.replace(/["';\s]/g, ''); // Remove all quotes, semicolons, and whitespace
  url = url.replace(/%22/g, ''); // Remove %22
  url = url.trim();
  url = url.replace(/\/+$/, ''); // Remove trailing slashes
  
  // Replace googleusercontent with script.google.com
  url = url.replace('script.googleusercontent.com', 'script.google.com');
  
  // Replace /dev with /exec
  if (url.endsWith('/dev')) {
    url = url.substring(0, url.length - 4) + '/exec';
  }
  
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
