import { customerService } from './services/customerService';
import { Customer } from './types';
import { companyService, Company } from './services/companyService';

export async function runCompanyDiagnostics() {
  console.log('%c🏢 STARTING COMPANIES API DIAGNOSTICS 🏢', 'color: #3b82f6; font-size: 13px; font-weight: bold;');
  
  const testCompanyName = 'Diagnostic Comp ' + Math.floor(Math.random() * 10000);
  let createdCompany: Company | null = null;
  let testResults = {
    list: { success: false, details: '', durationMs: 0 },
    create: { success: false, details: '', durationMs: 0 },
    update: { success: false, details: '', durationMs: 0 },
    search: { success: false, details: '', durationMs: 0 },
    getById: { success: false, details: '', durationMs: 0 },
    delete: { success: false, details: '', durationMs: 0 }
  };

  // 1. List Companies
  try {
    const start = Date.now();
    const list = await companyService.getCompanies();
    testResults.list.durationMs = Date.now() - start;
    testResults.list.success = Array.isArray(list);
    testResults.list.details = `Success: Retrieved ${list.length} companies in ${testResults.list.durationMs}ms.`;
  } catch (error: any) {
    testResults.list.details = `Error: ${error.message || error}`;
  }

  // 2. Create Company
  try {
    const start = Date.now();
    const payload = {
      companyName: testCompanyName,
      ownerName: 'Diagnostic Owner',
      mobile: '9876543210',
      email: 'diag@company.com',
      address: 'Diagnostic Suite 101',
      gstNumber: 'GSTIN-DIAG-123',
      subscriptionPlan: 'Enterprise',
      subscriptionStartDate: '2026-01-01',
      subscriptionEndDate: '2027-12-31',
      status: 'Active' as const
    };
    const res = await companyService.createCompany(payload);
    testResults.create.durationMs = Date.now() - start;
    if (res && res.id) {
      createdCompany = res;
      testResults.create.success = true;
      testResults.create.details = `Success: Created company with ID "${res.id}" in ${testResults.create.durationMs}ms.`;
    } else {
      testResults.create.details = `Failed: Response did not include an ID. Response: ${JSON.stringify(res)}`;
    }
  } catch (error: any) {
    testResults.create.details = `Error: ${error.message || error}`;
  }

  if (!createdCompany) {
    console.warn('%c⚠️ Expected Offline Fallback: Create company API failed. Skipping subsequent remote company diagnostics.', 'color: #f59e0b; font-weight: bold;');
    printSummaryTable('COMPANIES', testResults);
    return;
  }

  // 3. Update Company
  try {
    const start = Date.now();
    const updatedPayload: Company = {
      ...createdCompany,
      ownerName: 'Diagnostic Owner (Updated)',
      address: 'Diagnostic Suite 202'
    };
    const res = await companyService.updateCompany(updatedPayload);
    testResults.update.durationMs = Date.now() - start;
    if (res && res.ownerName === 'Diagnostic Owner (Updated)') {
      testResults.update.success = true;
      testResults.update.details = `Success: Company updated in ${testResults.update.durationMs}ms. Verified updated field: ownerName="${res.ownerName}"`;
      createdCompany = res;
    } else {
      testResults.update.details = `Failed: Updated data did not reflect in the response. Response: ${JSON.stringify(res)}`;
    }
  } catch (error: any) {
    testResults.update.details = `Error: ${error.message || error}`;
  }

  // 4. Search Company
  try {
    const start = Date.now();
    const query = testCompanyName.substring(0, 15);
    const results = await companyService.searchCompany(query);
    testResults.search.durationMs = Date.now() - start;
    const found = results.find(c => c.id === createdCompany?.id);
    if (found) {
      testResults.search.success = true;
      testResults.search.details = `Success: Company found in search of "${query}" in ${testResults.search.durationMs}ms.`;
    } else {
      testResults.search.details = `Failed: Company with ID "${createdCompany.id}" was not returned in search. Results: ${JSON.stringify(results)}`;
    }
  } catch (error: any) {
    testResults.search.details = `Error: ${error.message || error}`;
  }

  // 5. Get Company By ID
  try {
    const start = Date.now();
    const res = await companyService.getCompanyById(createdCompany.id);
    testResults.getById.durationMs = Date.now() - start;
    if (res && res.id === createdCompany.id) {
      testResults.getById.success = true;
      testResults.getById.details = `Success: Retrieved details successfully in ${testResults.getById.durationMs}ms. Name matches: "${res.companyName}"`;
    } else {
      testResults.getById.details = `Failed: Returned company object has different details or mismatch ID. Response: ${JSON.stringify(res)}`;
    }
  } catch (error: any) {
    testResults.getById.details = `Error: ${error.message || error}`;
  }

  // 6. Delete Company (Cleanup)
  try {
    const start = Date.now();
    const res = await companyService.deleteCompany(createdCompany.id);
    testResults.delete.durationMs = Date.now() - start;
    if (res && res.deleted) {
      testResults.delete.success = true;
      testResults.delete.details = `Success: Company with ID "${createdCompany.id}" deleted in ${testResults.delete.durationMs}ms.`;
    } else {
      testResults.delete.details = `Failed: Delete response returned false. Response: ${JSON.stringify(res)}`;
    }
  } catch (error: any) {
    testResults.delete.details = `Error: ${error.message || error}`;
  }

  printSummaryTable('COMPANIES', testResults);
}

function printSummaryTable(moduleName: string, results: any) {
  console.log(`%c📊 GOOGLE APPS SCRIPT ${moduleName} API DIAGNOSTICS REPORT 📊`, 'color: #06b6d4; font-size: 13px; font-weight: bold; text-decoration: underline;');
  
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
}

export async function runApiDiagnostics() {
  console.log('%c🚀 STARTING GOOGLE APPS SCRIPT API DIAGNOSTICS SUITE 🚀', 'color: #06b6d4; font-size: 14px; font-weight: bold; text-decoration: underline;');
  
  // Run Company Diagnostics
  await runCompanyDiagnostics().catch((err) => {
    console.warn("Company diagnostics failed/offline fallback:", err);
  });
  
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
    console.warn('%c⚠️ Expected Offline Fallback: Create customer API failed. Skipping subsequent remote customer diagnostics.', 'color: #f59e0b; font-weight: bold;');
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
