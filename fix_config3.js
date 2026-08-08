const fs = require('fs');
let code = fs.readFileSync('lib/config.ts', 'utf8');

const replacement = `export function saveApiUrl(url: string) {
  if (typeof window !== 'undefined') {
    if (url && url.trim()) {
      let cleanUrl = url.trim();
      try { cleanUrl = decodeURIComponent(cleanUrl); } catch (e) {}
      cleanUrl = cleanUrl.replace(/["';\\s]/g, ''); // Remove all quotes, semicolons, and whitespace
      cleanUrl = cleanUrl.replace(/%22/g, ''); // Remove %22
      cleanUrl = cleanUrl.replace(/\\/+$/, '');
      
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
}`;

code = code.replace(/export function saveApiUrl\([\s\S]*?\}\n\}/, replacement);

fs.writeFileSync('lib/config.ts', code);
