import { apiCall } from '../apiClient';
import { Prescription } from '../types';
import { customerService } from './customerService';

export const prescriptionService = {
  async savePrescription(customerId: string, prescription: Prescription): Promise<void> {
    try {
      await apiCall('savePrescription', { customerId, prescription });
    } catch (e) {
      console.warn('savePrescription API failed, saving locally:', e);
    }

    // Update in LocalStorage customer list
    const customers = await customerService.getCustomers();
    const idx = customers.findIndex(c => c.id === customerId);
    if (idx >= 0) {
      const customer = customers[idx];
      const prescriptions = customer.prescriptions || [];
      const pIdx = prescriptions.findIndex(p => p.id === prescription.id);
      if (pIdx >= 0) {
        prescriptions[pIdx] = prescription;
      } else {
        prescriptions.push(prescription);
      }
      customer.prescriptions = prescriptions;
      await customerService.saveCustomer(customer);
    }
  },

  async loadPrescriptionHistory(customerId: string): Promise<Prescription[]> {
    try {
      const res = await apiCall<Prescription[]>('loadPrescriptions', { customerId });
      if (Array.isArray(res)) return res;
    } catch (e) {
      console.warn('loadPrescriptions API failed, loading from customer store:', e);
    }

    const customers = await customerService.getCustomers();
    const customer = customers.find(c => c.id === customerId);
    return customer?.prescriptions || [];
  },

  async copyPreviousPrescription(customerId: string): Promise<Prescription | null> {
    const history = await this.loadPrescriptionHistory(customerId);
    if (history.length === 0) return null;
    const sorted = [...history].sort((a, b) => b.createdAt - a.createdAt);
    return sorted[0];
  }
};
