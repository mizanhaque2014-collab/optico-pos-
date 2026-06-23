import { API_URL } from './config';

export async function apiCall<T>(action: string, payload?: any): Promise<T> {
  const url = new URL(API_URL);
  url.searchParams.set('action', action);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 seconds timeout

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', 
      },
      body: JSON.stringify({
        action,
        ...(payload || {}),
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
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
    console.error(`apiCall [${action}] failed:`, error);
    throw error;
  }
}
