import { customerService } from './lib/services/customerService';

async function run() {
  const customerId = "CUST-1785591476621886";
  const result = await customerService.loadCustomerHistory(customerId);
  console.log(JSON.stringify(result, null, 2));
}

run();
