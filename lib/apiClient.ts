import { API_URL } from './config';

export async function apiCall<T>(action: string, argPayload?: any): Promise<T> {
  const url = new URL(API_URL);
  url.searchParams.set('action', action);
  
  const payload = {
    action,
    ...(argPayload || {}),
  };

  console.log("API URL", url.toString());
  console.log("REQUEST BODY", payload);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.warn(`Request to [${action}] timed out after 60 seconds.`);
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
    
    console.log("API RESPONSE", response);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const text = await response.text();
    try {
      const result = JSON.parse(text);
      if (result && result.success === false) {
        throw new Error(result.error || 'Apps Script returned failure');
      }
      return result.data !== undefined ? result.data : result;
    } catch {
      return text as any;
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("API ERROR", error);
    throw error;
  }
}
