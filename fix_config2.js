const fs = require('fs');
let code = fs.readFileSync('lib/config.ts', 'utf8');

const replacement = `function getCleanApiUrl() {
  if (typeof window === 'undefined') return DEFAULT_API_URL;
  let url = localStorage.getItem('opt_api_url') || DEFAULT_API_URL;
  
  // Clean up any stray quotes, semicolons, or whitespace that might have been accidentally saved
  try { url = decodeURIComponent(url); } catch (e) {}
  url = url.replace(/["';\\s]/g, ''); // Remove all quotes, semicolons, and whitespace
  url = url.replace(/%22/g, ''); // Remove %22
  url = url.trim();
  url = url.replace(/\\/+$/, ''); // Remove trailing slashes
  
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
}`;

code = code.replace(/function getCleanApiUrl\(\) \{[\s\S]*?return url \|\| DEFAULT_API_URL;\n\}/, replacement);

fs.writeFileSync('lib/config.ts', code);
