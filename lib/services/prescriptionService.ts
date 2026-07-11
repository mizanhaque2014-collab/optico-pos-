import { apiCall } from '../apiClient';
import { customerService } from './customerService';

export interface PrescriptionPascal {
  PrescriptionID: string;
  CustomerID: string;
  CompanyID: string;
  BranchID: string;
  DoctorName: string;
  ExamDate: string;
  Complaint: string;
  Diagnosis: string;
  Advice: string;
  Remarks: string;
  OD_Distance_SPH: string;
  OD_Distance_CYL: string;
  OD_Distance_AXIS: string;
  OS_Distance_SPH: string;
  OS_Distance_CYL: string;
  OS_Distance_AXIS: string;
  AddPower: string;
  PD_Distance: string;
  PD_Near: string;
  CreatedDate: number;
}

// Convert from PascalCase (API/DB representation) to Standard (Frontend state representation)
export function mapPascalToStandard(p: PrescriptionPascal): any {
  return {
    id: p.PrescriptionID,
    source: 'Eye Test Performed In Shop',
    sphOd: p.OD_Distance_SPH,
    cylOd: p.OD_Distance_CYL,
    axisOd: p.OD_Distance_AXIS,
    sphOs: p.OS_Distance_SPH,
    cylOs: p.OS_Distance_CYL,
    axisOs: p.OS_Distance_AXIS,
    addPower: p.AddPower,
    pdDistance: p.PD_Distance,
    pdNear: p.PD_Near,
    remarks: p.Remarks,
    optometristName: p.DoctorName,
    eyeTestDate: p.ExamDate,
    complaint: p.Complaint,
    diagnosis: p.Diagnosis,
    advice: p.Advice,
    createdAt: p.CreatedDate || Date.now(),
    
    // Nested structure for compatibility with standard types
    rightEye: {
      sph: p.OD_Distance_SPH,
      cyl: p.OD_Distance_CYL,
      axis: p.OD_Distance_AXIS,
      add: p.AddPower,
    },
    leftEye: {
      sph: p.OS_Distance_SPH,
      cyl: p.OS_Distance_CYL,
      axis: p.OS_Distance_AXIS,
      add: p.AddPower,
    },
    eyeTestDetails: {
      optometristName: p.DoctorName,
      eyeTestDate: p.ExamDate,
      remarks: p.Remarks,
    }
  };
}

// Standalone overloaded function for object-literal assignment
async function savePrescriptionImpl(prescription: Partial<PrescriptionPascal>): Promise<PrescriptionPascal>;
async function savePrescriptionImpl(customerId: string, prescription: any): Promise<PrescriptionPascal>;
async function savePrescriptionImpl(
  arg1: Partial<PrescriptionPascal> | string,
  arg2?: any
): Promise<PrescriptionPascal> {
  let prescription: Partial<PrescriptionPascal>;

  if (typeof arg1 === 'string' && arg2) {
    // Legacy call: savePrescription(customerId, prescription)
    const customerId = arg1;
    const legacyP = arg2;
    prescription = {
      PrescriptionID: legacyP.id,
      CustomerID: customerId,
      CompanyID: legacyP.companyId || '',
      BranchID: legacyP.branchId || '',
      DoctorName: legacyP.optometristName || legacyP.doctorName || legacyP.eyeTestDetails?.optometristName || '',
      ExamDate: legacyP.eyeTestDate || legacyP.prescriptionDate || legacyP.eyeTestDetails?.eyeTestDate || new Date().toISOString().split('T')[0],
      Complaint: legacyP.complaint || '',
      Diagnosis: legacyP.diagnosis || '',
      Advice: legacyP.advice || '',
      Remarks: legacyP.remarks || legacyP.eyeTestDetails?.remarks || '',
      OD_Distance_SPH: legacyP.sphOd || legacyP.rightEye?.sph || '',
      OD_Distance_CYL: legacyP.cylOd || legacyP.rightEye?.cyl || '',
      OD_Distance_AXIS: legacyP.axisOd || legacyP.rightEye?.axis || '',
      OS_Distance_SPH: legacyP.sphOs || legacyP.leftEye?.sph || '',
      OS_Distance_CYL: legacyP.cylOs || legacyP.leftEye?.cyl || '',
      OS_Distance_AXIS: legacyP.axisOs || legacyP.leftEye?.axis || '',
      AddPower: legacyP.addPower || legacyP.rightEye?.add || legacyP.leftEye?.add || '',
      PD_Distance: legacyP.pdDistance || '',
      PD_Near: legacyP.pdNear || '',
      CreatedDate: legacyP.createdAt || Date.now(),
    };
  } else {
    prescription = arg1 as Partial<PrescriptionPascal>;
  }

  let result: PrescriptionPascal;
  try {
    if (prescription.PrescriptionID) {
      // Update prescription
      const res = await apiCall<any>('updatePrescription', { prescription });
      result = res.data || res;
    } else {
      // Create prescription
      const res = await apiCall<any>('createPrescription', { prescription });
      result = res.data || res;
    }
  } catch (e) {
    console.warn('Remote savePrescription failed, fallback to local save:', e);
    // Construct a mockup response for local cache
    result = {
      PrescriptionID: prescription.PrescriptionID || `PRE-${Math.random().toString(36).substring(2, 14).toUpperCase()}`,
      CustomerID: prescription.CustomerID || '',
      CompanyID: prescription.CompanyID || '',
      BranchID: prescription.BranchID || '',
      DoctorName: prescription.DoctorName || '',
      ExamDate: prescription.ExamDate || new Date().toISOString().split('T')[0],
      Complaint: prescription.Complaint || '',
      Diagnosis: prescription.Diagnosis || '',
      Advice: prescription.Advice || '',
      Remarks: prescription.Remarks || '',
      OD_Distance_SPH: prescription.OD_Distance_SPH || '',
      OD_Distance_CYL: prescription.OD_Distance_CYL || '',
      OD_Distance_AXIS: prescription.OD_Distance_AXIS || '',
      OS_Distance_SPH: prescription.OS_Distance_SPH || '',
      OS_Distance_CYL: prescription.OS_Distance_CYL || '',
      OS_Distance_AXIS: prescription.OS_Distance_AXIS || '',
      AddPower: prescription.AddPower || '',
      PD_Distance: prescription.PD_Distance || '',
      PD_Near: prescription.PD_Near || '',
      CreatedDate: prescription.CreatedDate || Date.now(),
    };
  }

  // Sync to local customer list cache
  const customers = await customerService.getCustomers();
  const customerId = result.CustomerID;
  const idx = customers.findIndex(c => c.id === customerId);
  if (idx >= 0) {
    const customer = customers[idx];
    const prescriptions = customer.prescriptions || [];
    const stdPrescription = mapPascalToStandard(result);
    
    const pIdx = prescriptions.findIndex((p: any) => p.id === result.PrescriptionID);
    if (pIdx >= 0) {
      prescriptions[pIdx] = stdPrescription;
    } else {
      prescriptions.push(stdPrescription);
    }
    customer.prescriptions = prescriptions;
    customerService.updateLocalCache(customer);
  }

  return result;
}

export const prescriptionService = {
  // Save or update prescription
  savePrescription: savePrescriptionImpl,

  // Load prescription history from API with local cache fallback
  async loadPrescriptionHistory(customerId: string): Promise<PrescriptionPascal[]> {
    try {
      const res = await apiCall<any>('getPrescriptionsByCustomer', { customerId });
      const data = res.data || res;
      if (Array.isArray(data)) {
        return data;
      }
    } catch (e) {
      console.warn('getPrescriptionsByCustomer API failed, loading from customer store:', e);
    }

    const customers = await customerService.getCustomers();
    const customer = customers.find(c => c.id === customerId);
    const localHistory = customer?.prescriptions || [];
    
    // Map back to PascalCase for UI consumption uniformity
    return localHistory.map((p: any) => ({
      PrescriptionID: p.id,
      CustomerID: customerId,
      CompanyID: p.companyId || '',
      BranchID: p.branchId || '',
      DoctorName: p.optometristName || p.doctorName || p.eyeTestDetails?.optometristName || '',
      ExamDate: p.eyeTestDate || p.prescriptionDate || p.eyeTestDetails?.eyeTestDate || '',
      Complaint: p.complaint || '',
      Diagnosis: p.diagnosis || '',
      Advice: p.advice || '',
      Remarks: p.remarks || '',
      OD_Distance_SPH: p.sphOd || p.rightEye?.sph || '',
      OD_Distance_CYL: p.cylOd || p.rightEye?.cyl || '',
      OD_Distance_AXIS: p.axisOd || p.rightEye?.axis || '',
      OS_Distance_SPH: p.sphOs || p.leftEye?.sph || '',
      OS_Distance_CYL: p.cylOs || p.leftEye?.cyl || '',
      OS_Distance_AXIS: p.axisOs || p.leftEye?.axis || '',
      AddPower: p.addPower || p.rightEye?.add || p.leftEye?.add || '',
      PD_Distance: p.pdDistance || '',
      PD_Near: p.pdNear || '',
      CreatedDate: p.createdAt || Date.now(),
    }));
  },

  // Copy previous prescription helper
  async copyPreviousPrescription(customerId: string): Promise<PrescriptionPascal | null> {
    const history = await this.loadPrescriptionHistory(customerId);
    if (history.length === 0) return null;
    // Sorted by CreatedDate descending in database, so first is newest
    return history[0];
  },

  // Delete prescription
  async deletePrescription(prescriptionId: string): Promise<void> {
    try {
      await apiCall('deletePrescription', { prescriptionId });
    } catch (e) {
      console.warn('deletePrescription API failed:', e);
    }
  }
};
