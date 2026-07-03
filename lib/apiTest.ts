import { customerService } from './services/customerService';
import { Customer } from './types';

export async function runApiDiagnostics() {
  console.log('%c🚀 STARTING GOOGLE APPS SCRIPT API DIAGNOSTICS SUITE 🚀', 'color: #06b6d4; font-size: 14px; font-weight: bold; text-decoration: underline;');
  
  const testMobile = '01' + Math.floor(10000000 + Math.random() * 90000000); // Unique 10-digit number
  let createdCustomer: Customer | null = null;
  let testResults = {
    create: { success: false, details: '', durationMs: 0 },
    update: { success: false, details: '', durationMs: 0 },
    searchMobile: { success: false, details: '', durationMs: 0 },
    searchName: { success: false, details: '', durationMs: 0 },
    getById: { success: false, details: '', durationMs: 0 }
  };

  // --- TEST 1: Create Customer ---
  try {
    const start = Date.now();
    const payload: Omit<Customer, 'id' | 'createdAt'> = {
      name: 'System Test Client',
      mobile: testMobile,
      dob: '1995-05-15',
      address: 'Suite 101, API Labs',
      status: 'Buyer',
      prescriptions: []
    };
    
    console.log('%c[TEST 1/5] Calling createCustomer...', 'color: #3b82f6; font-weight: bold;');
    const res = await customerService.createCustomer(payload);
    
    testResults.create.durationMs = Date.now() - start;
    if (res && res.id) {
      createdCustomer = res;
      testResults.create.success = true;
      testResults.create.details = `Success: Created customer with ID "${res.id}" in ${testResults.create.durationMs}ms.`;
    } else {
      testResults.create.details = `Failed: Response did not include an ID. Response: ${JSON.stringify(res)}`;
    }
  } catch (error: any) {
    testResults.create.details = `Error: ${error.message || error}`;
  }

  // If Test 1 fails, we cannot run the rest of the tests accurately
  if (!createdCustomer) {
    console.error('%c❌ Critical: Create customer failed. Skipping subsequent Tests.', 'color: #ef4444; font-weight: bold;');
    printSummary(testResults);
    return;
  }

  // --- TEST 2: Update Customer ---
  try {
    const start = Date.now();
    const updatedPayload: Customer = {
      ...createdCustomer,
      name: 'System Test Client (Updated)',
      address: 'Suite 202, Connected Offices'
    };

    console.log('%c[TEST 2/5] Calling updateCustomer...', 'color: #3b82f6; font-weight: bold;');
    const res = await customerService.updateCustomer(updatedPayload);
    
    testResults.update.durationMs = Date.now() - start;
    if (res && res.name === 'System Test Client (Updated)') {
      testResults.update.success = true;
      testResults.update.details = `Success: Customer updated in ${testResults.update.durationMs}ms. Verified updated field: name="${res.name}"`;
      createdCustomer = res; // Update the reference
    } else {
      testResults.update.details = `Failed: Updated data did not reflect in the response. Response: ${JSON.stringify(res)}`;
    }
  } catch (error: any) {
    testResults.update.details = `Error: ${error.message || error}`;
  }

  // --- TEST 3: Search Customer by Mobile ---
  try {
    const start = Date.now();
    console.log(`%c[TEST 3/5] Calling searchCustomerByMobile for "${testMobile}"...`, 'color: #3b82f6; font-weight: bold;');
    const results = await customerService.searchCustomerByMobile(testMobile);
    
    testResults.searchMobile.durationMs = Date.now() - start;
    const found = results.find(c => c.id === createdCustomer?.id);
    
    if (found) {
      testResults.searchMobile.success = true;
      testResults.searchMobile.details = `Success: Customer found in list of ${results.length} matches in ${testResults.searchMobile.durationMs}ms.`;
    } else {
      testResults.searchMobile.details = `Failed: Customer with ID "${createdCustomer.id}" and mobile "${testMobile}" was not returned in search. Results: ${JSON.stringify(results)}`;
    }
  } catch (error: any) {
    testResults.searchMobile.details = `Error: ${error.message || error}`;
  }

  // --- TEST 4: Search Customer by Name ---
  try {
    const start = Date.now();
    const nameQuery = 'System Test';
    console.log(`%c[TEST 4/5] Calling searchCustomerByName for "${nameQuery}" (partial search)...`, 'color: #3b82f6; font-weight: bold;');
    const results = await customerService.searchCustomerByName(nameQuery);
    
    testResults.searchName.durationMs = Date.now() - start;
    const found = results.find(c => c.id === createdCustomer?.id);
    
    if (found) {
      testResults.searchName.success = true;
      testResults.searchName.details = `Success: Customer found in list of ${results.length} partial name matches in ${testResults.searchName.durationMs}ms.`;
    } else {
      testResults.searchName.details = `Failed: Customer not found. Searched query: "${nameQuery}". Results: ${JSON.stringify(results)}`;
    }
  } catch (error: any) {
    testResults.searchName.details = `Error: ${error.message || error}`;
  }

  // --- TEST 5: Get Customer by ID ---
  try {
    const start = Date.now();
    console.log(`%c[TEST 5/5] Calling getCustomerById for "${createdCustomer.id}"...`, 'color: #3b82f6; font-weight: bold;');
    const res = await customerService.getCustomerById(createdCustomer.id);
    
    testResults.getById.durationMs = Date.now() - start;
    if (res && res.id === createdCustomer.id) {
      testResults.getById.success = true;
      testResults.getById.details = `Success: Retrieved details successfully in ${testResults.getById.durationMs}ms. Name matches: "${res.name}"`;
    } else {
      testResults.getById.details = `Failed: Returned customer object has different details or mismatch ID. Response: ${JSON.stringify(res)}`;
    }
  } catch (error: any) {
    testResults.getById.details = `Error: ${error.message || error}`;
  }

  // --- Print Final Diagnostics Summary ---
  printSummary(testResults);
}

function printSummary(results: any) {
  console.log('%c📊 GOOGLE APPS SCRIPT API DIAGNOSTICS SUMMARY REPORT 📊', 'color: #06b6d4; font-size: 13px; font-weight: bold; text-decoration: underline;');
  
  const formattedTable = Object.keys(results).map(key => {
    const status = results[key].success ? '🟢 PASS' : '🔴 FAIL';
    return {
      'Test Requirement': key.toUpperCase(),
      'Status': status,
      'Latency (ms)': results[key].durationMs || 'N/A',
      'Details': results[key].details
    };
  });
  
  console.table(formattedTable);
  
  const allPassed = Object.values(results).every((r: any) => r.success);
  if (allPassed) {
    console.log('%c🎉 ALL 5 CUSTOMER API ENDPOINTS ARE INTEGRATED AND RESPONDING CORRECTLY! 🎉', 'color: #10b981; font-size: 13px; font-weight: bold;');
  } else {
    console.warn('%c⚠️ SOME CONNECTION STEPS FAILED. Please check detailed error statements above and ensure Sheets Apps Script is fully published and accessible.', 'color: #f59e0b; font-size: 12px; font-weight: bold;');
  }
}
