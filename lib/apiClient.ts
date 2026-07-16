import { API_URL } from './config';

export async function apiCall<T>(action: string, argPayload?: any): Promise<T> {
  const url = new URL(API_URL);
  url.searchParams.set('action', action);
  
  const payload = {
    action,
    ...(argPayload || {}),
  };

  const pData = payload.prescription || payload.eyeTest || payload.eyeTestDetails || payload;
  const customerId = payload.CustomerID || payload.customerId || pData?.CustomerID || pData?.customerId || '';
  const prescriptionId = payload.PrescriptionID || payload.prescriptionId || pData?.PrescriptionID || pData?.prescriptionId || '';

  console.log("ENTER apiClient.apiCall");
  console.log("Payload:", payload);
  console.log("CustomerID:", customerId);
  console.log("PrescriptionID:", prescriptionId);
  console.log("Action:", action);

  console.log(`%c[API REQUEST] Action: ${action}`, 'color: #06b6d4; font-weight: bold;', {
    url: url.toString(),
    payload,
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.warn(`%c[API TIMEOUT] Request to [${action}] timed out after 60 seconds.`, 'color: #f59e0b; font-weight: bold;');
    controller.abort();
  }, 60000); // Extended 60 seconds timeout specifically for cold-starting Apps Script web apps

  let text = '';
  try {
    console.log("ENTER fetch");
    console.log("Payload:", JSON.stringify(payload));
    console.log("CustomerID:", customerId);
    console.log("PrescriptionID:", prescriptionId);
    console.log("Action: POST " + url.toString());

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
    
    text = await response.text();
    console.log("Return value:", text);
    console.log("EXIT fetch");
    console.log(`%c[API RAW RESPONSE] Action: ${action}`, 'color: #10b981;', text);
    
    try {
      const result = JSON.parse(text);
      if (result && typeof result.success === 'boolean') {
        // Output backend logs if present in the response
        if (Array.isArray(result.logs)) {
          console.groupCollapsed(`%c[APPS SCRIPT BACKEND LOGS] Action: ${action}`, 'color: #8b5cf6; font-weight: bold;');
          result.logs.forEach((log: string) => {
            console.log(`%c${log}`, 'color: #c084fc;');
          });
          console.groupEnd();

          // Step-by-step trace parsing for backend execution logs
          console.log("%c================ BACKEND EXECUTION TRACE ================", "color: #a855f7; font-weight: bold;");
          
          // 1. doPost
          console.log("ENTER Google Apps Script doPost()");
          console.log("Payload:", payload);
          console.log("CustomerID:", customerId);
          console.log("PrescriptionID:", prescriptionId);
          console.log("Action: doPost");

          // 2. Router switch(action)
          console.log("ENTER Router switch(action)");
          console.log("Payload:", payload);
          console.log("CustomerID:", customerId);
          console.log("PrescriptionID:", prescriptionId);
          console.log("Action: switch(" + action + ")");
          console.log("Return value: matched case '" + action + "'");
          console.log("EXIT Router switch(action)");

          // 3. createPrescription / validatePrescriptionBackend / appendRow (conditional check)
          const hasValidationStart = result.logs.some((l: string) => l.includes("validatePrescriptionBackend start"));
          const hasValidationPassed = result.logs.some((l: string) => l.includes("Validation passed"));
          const hasAppendingRow = result.logs.some((l: string) => l.includes("Appending row"));
          const hasAppendFinished = result.logs.some((l: string) => l.includes("appendRow finished"));
          const hasSuccess = result.success;

          if (action === 'createPrescription') {
            console.log("ENTER createPrescription()");
            console.log("Payload:", payload);
            console.log("CustomerID:", customerId);
            console.log("PrescriptionID:", prescriptionId);
            console.log("Action: createPrescription");

            if (hasValidationStart) {
              console.log("ENTER validatePrescriptionBackend()");
              console.log("Payload:", payload);
              console.log("CustomerID:", customerId);
              console.log("PrescriptionID:", prescriptionId);
              console.log("Action: validatePrescriptionBackend");
              console.log("Return value: " + (hasValidationPassed ? "Validation Passed" : "Validation Failed"));
              console.log("EXIT validatePrescriptionBackend()");
            }

            if (hasAppendingRow) {
              console.log("ENTER appendRow()");
              console.log("Payload:", payload);
              console.log("CustomerID:", customerId);
              console.log("PrescriptionID:", prescriptionId);
              console.log("Action: appendRow to sheet 'Prescriptions'");
              console.log("Return value: " + (hasAppendFinished ? "Success" : "Failed"));
              console.log("EXIT appendRow()");
            }

            console.log("Return value:", result.data);
            console.log("EXIT createPrescription()");
          }

          // Return success:true
          console.log("Return value: { success: " + hasSuccess + ", data: " + JSON.stringify(result.data) + " }");
          console.log("EXIT Google Apps Script doPost()");
          console.log("%c========================================================", "color: #a855f7; font-weight: bold;");
        }

        if (!result.success) {
          throw new Error(result.error || 'Unknown error');
        }
        console.log("Backend Success");
        console.log(`%c[API RESPONSE SUCCESS] Action: ${action}`, 'color: #10b981; font-weight: bold;', result.data);
        
        console.log("Return value:", result.data);
        console.log("EXIT apiClient.apiCall");
        return result.data;
      }
      
      console.log(`%c[API RESPONSE UNEXPECTED FORMAT] Action: ${action}`, 'color: #f59e0b; font-weight: bold;', result);
      console.log("Return value:", result);
      console.log("EXIT apiClient.apiCall");
      return result;
    } catch (parseError) {
      console.log(`%c[API RESPONSE TEXT] Action: ${action}`, 'color: #10b981; font-weight: bold;', text);
      console.log("Return value:", text);
      console.log("EXIT apiClient.apiCall");
      return text as any;
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.log("Return value (ERROR):", error.message || error);
    console.log("EXIT fetch (ERROR)");
    console.log("EXIT apiClient.apiCall (ERROR)");
    
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

