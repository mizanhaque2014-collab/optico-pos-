import { apiCall } from '../apiClient';
import { normalizeEyeTest } from '../dataMapping';

export interface EyeTestRecord {
  id: string;
  companyId: string;
  branchId: string;
  customerId: string;
  eyeTestDate: string;
  optometristName: string;
  
  // Distance Vision
  sphOd: string;
  cylOd: string;
  axisOd: string;
  sphOs: string;
  cylOs: string;
  axisOs: string;
  addPower: string;

  // Additional Measurements
  pdDistance: string;
  pdNear: string;
  segmentHeight: string;
  lensRecommendation: string;
  remarks: string;

  createdAt: number;
}

export const eyeTestService = {
  async saveEyeTest(eyeTest: EyeTestRecord): Promise<EyeTestRecord> {
    console.log("ENTER saveEyeTest");
    console.log("INPUT: eyeTest =", eyeTest);
    try {const res = await apiCall<any>('saveEyeTest', { eyeTestDetails: eyeTest });
      if (res && res.id) {
        const normalized = normalizeEyeTest(res);
        this.saveLocalEyeTest(normalized);
        console.log("EXIT saveEyeTest");
        console.log("RETURN/OUTPUT:", normalized);
        return normalized;
      }
    } catch (e) {
      console.warn('saveEyeTest API failed, saving locally:', e);
    }

    const localEyeTest = {
      ...eyeTest,
      id: eyeTest.id || `ET-local-${Date.now()}`,
      createdAt: eyeTest.createdAt || Date.now()
    };
    this.saveLocalEyeTest(localEyeTest);
    console.log("EXIT saveEyeTest");
    console.log("RETURN/OUTPUT:", localEyeTest);
    return localEyeTest;
  },

  async loadEyeTestHistory(customerId: string): Promise<EyeTestRecord[]> {
    try {const res = await apiCall<any[]>('loadEyeTests', { customerId });
      if (Array.isArray(res)) {
        // Filter and map to standard record properties just in case
        return res.map(normalizeEyeTest).sort((a: any, b: any) => b.createdAt - a.createdAt);
      }
    } catch (e) {
      console.warn('loadEyeTests API failed, getting from local storage:', e);
    }

    const all = this.getLocalEyeTests();
    return all.filter(et => et.customerId === customerId).sort((a, b) => b.createdAt - a.createdAt);
  },

  // Helper local storage accessors
  getLocalEyeTests(): EyeTestRecord[] {
    if (typeof window === 'undefined') return [];
    try {const data = localStorage.getItem('opt_eyetests');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveLocalEyeTest(et: EyeTestRecord) {
    if (typeof window === 'undefined') return;
    try {const all = this.getLocalEyeTests();
      const idx = all.findIndex(item => item.id === et.id);
      if (idx >= 0) {
        all[idx] = et;
      } else {
        all.push(et);
      }
      localStorage.setItem('opt_eyetests', JSON.stringify(all));
    } catch (e) {
      console.error(e);
    }
  }
};
