import { API_URL } from './config';

export async function apiCall<T>(action: string, argPayload?: any): Promise<T> {
  const url = new URL(API_URL);
  url.searchParams.set('action', action);
  
  const payload = {
    action,
    ...(argPayload || {}),
  };

  console.log(`%c[API REQUEST] Action: ${action}`, 'color: #06b6d4; font-weight: bold;', {
    url: url.toString(),
    payload,
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.warn(`%c[API TIMEOUT] Request to [${action}] timed out after 60 seconds.`, 'color: #f59e0b; font-weight: bold;');
    controller.abort();
  }, 60000); // Extended 60 seconds timeout specifically for cold-starting Apps Script web apps

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', 
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const text = await response.text();
    console.log(`%c[API RAW RESPONSE] Action: ${action}`, 'color: #10b981;', text);
    
    try {
      const result = JSON.parse(text);
      if (result && result.success === false) {
        throw new Error(result.error || 'Apps Script returned failure');
      }
      
      const data = result.data !== undefined ? result.data : result;
      console.log(`%c[API RESPONSE SUCCESS] Action: ${action}`, 'color: #10b981; font-weight: bold;', data);
      return data;
    } catch (parseError) {
      console.log(`%c[API RESPONSE TEXT] Action: ${action}`, 'color: #10b981; font-weight: bold;', text);
      return text as any;
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // 1. Check if it's a CORS or network connectivity issue (Failed to fetch)
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.warn(`%c[API CORS / NETWORK WARNING] Action: ${action}
Possible Causes:
- CORS issue: Apps Script Web App was NOT deployed with "Who has access: Anyone".
- Network offline: No active internet connection.
- Blocked: Browser extension or iframe sandbox blocking the external fetch request.
To fix CORS, please redeploy the Google Apps Script in Extensions -> Apps Script as:
- Execute as: "Me" (your email)
- Who has access: "Anyone"`, 'color: #ef4444; font-weight: bold;');
      throw new Error("Network error: Could not connect to the API. Ensure Apps Script is deployed with 'Who has access: Anyone'.");
    }
    
    // 2. Check if it's a 404 Endpoint / Deployment mismatch error
    if (error.message && error.message.includes('404')) {
      console.warn(`%c[API 404 NOT FOUND / DEPLOYMENT WARNING] Action: ${action}
Possible Causes:
- Endpoint mismatch: The URL inside 'lib/config.ts' is incorrect, has typos, or is expired.
- Not Deployed: The Google Apps Script has not been deployed as a "Web app".
- Action Not Supported: The action "${action}" is not handled by the deployed Apps Script (e.g. getInventory is a frontend-only local action but was sent to backend).`, 'color: #ef4444; font-weight: bold;');
      throw error;
    }
    
    // 3. Other errors (e.g. Request/Response format errors, syntax issues)
    console.warn(`%c[API RESPONSE ERROR] Action: ${action}`, 'color: #ef4444; font-weight: bold;', error);
    throw error;
  }
}

