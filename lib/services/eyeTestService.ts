import { apiCall } from '../apiClient';
import { customerService } from './customerService';

export const eyeTestService = {
  async saveEyeTest(customerId: string, prescriptionId: string, eyeTestDetails: any): Promise<void> {
    try {
      await apiCall('saveEyeTest', { customerId, prescriptionId, eyeTestDetails });
    } catch (e) {
      console.warn('saveEyeTest API failed, saving locally:', e);
    }

    const customers = await customerService.getCustomers();
    const idx = customers.findIndex(c => c.id === customerId);
    if (idx >= 0) {
      const customer = customers[idx];
      const prescriptions = customer.prescriptions || [];
      const pIdx = prescriptions.findIndex(p => p.id === prescriptionId);
      if (pIdx >= 0) {
        prescriptions[pIdx].eyeTestDetails = eyeTestDetails;
        customer.prescriptions = prescriptions;
        await customerService.saveCustomer(customer);
      }
    }
  },

  async loadEyeTestHistory(customerId: string): Promise<any[]> {
    try {
      const res = await apiCall<any[]>('loadEyeTests', { customerId });
      if (Array.isArray(res)) return res;
    } catch (e) {
      console.warn('loadEyeTests API failed, getting from local schema:', e);
    }

    const customers = await customerService.getCustomers();
    const customer = customers.find(c => c.id === customerId);
    if (!customer?.prescriptions) return [];
    return customer.prescriptions
      .filter(p => !!p.eyeTestDetails)
      .map(p => ({
        prescriptionId: p.id,
        ...p.eyeTestDetails,
        createdAt: p.createdAt
      }));
  }
};
