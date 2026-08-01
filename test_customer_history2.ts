import { customerService } from './lib/services/customerService';
import { apiCall } from './lib/apiClient';

async function run() {
  const customerId = "CUST-1785591476621886";
  try {
    const res = await apiCall('loadCustomerHistory', { customerId });
    console.log("apiCall loadCustomerHistory result:", res);
  } catch(e) {
    console.error("apiCall loadCustomerHistory error:", e);
  }
}

run();
