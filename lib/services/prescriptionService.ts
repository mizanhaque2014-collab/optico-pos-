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
  Source: string;
  CreatedDate: number;
}

export function mapRawToPascal(p: any): PrescriptionPascal {
  if (!p) {
    return {
      PrescriptionID: '',
      CustomerID: '',
      CompanyID: '',
      BranchID: '',
      DoctorName: '',
      ExamDate: '',
      Complaint: '',
      Diagnosis: '',
      Advice: '',
      Remarks: '',
      OD_Distance_SPH: '',
      OD_Distance_CYL: '',
      OD_Distance_AXIS: '',
      OS_Distance_SPH: '',
      OS_Distance_CYL: '',
      OS_Distance_AXIS: '',
      AddPower: '',
      PD_Distance: '',
      PD_Near: '',
      Source: 'Eye Test Performed In Shop',
      CreatedDate: Date.now()
    };
  }
  return {
    PrescriptionID: String(p.PrescriptionID || p.prescriptionId || p.id || p.prescriptionID || ''),
    CustomerID: String(p.CustomerID || p.customerId || p.customerID || ''),
    CompanyID: String(p.CompanyID || p.companyId || ''),
    BranchID: String(p.BranchID || p.branchId || ''),
    DoctorName: String(p.DoctorName || p.doctorName || p.optometristName || p.optometrist || (p.eyeTestDetails && p.eyeTestDetails.optometristName) || ''),
    ExamDate: String(p.ExamDate || p.examDate || p.eyeTestDate || (p.eyeTestDetails && p.eyeTestDetails.eyeTestDate) || ''),
    Complaint: String(p.Complaint || p.complaint || ''),
    Diagnosis: String(p.Diagnosis || p.diagnosis || ''),
    Advice: String(p.Advice || p.advice || ''),
    Remarks: String(p.Remarks || p.remarks || (p.eyeTestDetails && p.eyeTestDetails.remarks) || ''),
    OD_Distance_SPH: String(p.OD_Distance_SPH || p.OD_SPH || p.rightSph || p.sphOd || (p.rightEye && p.rightEye.sph) || ''),
    OD_Distance_CYL: String(p.OD_Distance_CYL || p.OD_CYL || p.rightCyl || p.cylOd || (p.rightEye && p.rightEye.cyl) || ''),
    OD_Distance_AXIS: String(p.OD_Distance_AXIS || p.OD_AXIS || p.rightAxis || p.axisOd || (p.rightEye && p.rightEye.axis) || ''),
    OS_Distance_SPH: String(p.OS_Distance_SPH || p.OS_SPH || p.leftSph || p.sphOs || (p.leftEye && p.leftEye.sph) || ''),
    OS_Distance_CYL: String(p.OS_Distance_CYL || p.OS_CYL || p.leftCyl || p.cylOs || (p.leftEye && p.leftEye.cyl) || ''),
    OS_Distance_AXIS: String(p.OS_Distance_AXIS || p.OS_AXIS || p.leftAxis || p.axisOs || (p.leftEye && p.leftEye.axis) || ''),
    AddPower: String(p.AddPower || p.ADD || p.addPower || p.rightAdd || p.leftAdd || (p.rightEye && p.rightEye.add) || ''),
    PD_Distance: String(p.PD_Distance || p.PD || p.pdDistance || ''),
    PD_Near: String(p.PD_Near || p.PD || p.pdNear || ''),
    Source: String(p.Source || p.source || 'Eye Test Performed In Shop'),
    CreatedDate: Number(p.CreatedDate || p.createdAt || p.createdDate || Date.now())
  };
}

// Convert from PascalCase (API/DB representation) to Standard (Frontend state representation)
export function mapPascalToStandard(p: PrescriptionPascal): any {
  return {
    id: p.PrescriptionID,
    source: p.Source || 'Eye Test Performed In Shop',
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
  console.log("ENTER prescriptionService.savePrescription");
  console.log("Payload:", arg1);
  const pCustId = typeof arg1 === 'string' ? arg1 : (arg1 as any)?.CustomerID || (arg1 as any)?.customerId || '';
  const pPresId = typeof arg1 === 'string' ? (arg2?.id || arg2?.PrescriptionID || '') : (arg1 as any)?.PrescriptionID || (arg1 as any)?.prescriptionId || '';
  console.log("CustomerID:", pCustId);
  console.log("PrescriptionID:", pPresId);
  console.log("Action: savePrescription");
  console.log("INPUT: arg1:", arg1, "arg2:", arg2);
  
  let prescription: Partial<PrescriptionPascal>;

  let currentCompanyId = '';
  let currentBranchId = '';
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('opt_current_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        currentCompanyId = parsed.companyId || parsed.CompanyID || '';
        currentBranchId = parsed.branchId || parsed.BranchID || (parsed.branches && parsed.branches[0]) || '';
        console.log("[SERVICE DEBUG 2] Loaded from local storage - companyId:", currentCompanyId, "branchId:", currentBranchId);
      }
    } catch (e) {
      console.warn("[SERVICE DEBUG WARNING] Failed to parse current user for prescription save:", e);
    }
  }

  if (typeof arg1 === 'string' && arg2) {
    // Legacy call: savePrescription(customerId, prescription)
    console.log("[SERVICE DEBUG 3] Processing legacy format call. CustomerID:", arg1);
    const customerId = arg1;
    const legacyP = arg2;
    prescription = {
      PrescriptionID: legacyP.id,
      CustomerID: customerId,
      CompanyID: legacyP.companyId || legacyP.CompanyID || currentCompanyId || 'COMP-default',
      BranchID: legacyP.branchId || legacyP.BranchID || currentBranchId || 'BR-default',
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
      Source: legacyP.source || 'Eye Test Performed In Shop',
      CreatedDate: legacyP.createdAt || Date.now(),
    };
    console.log("[SERVICE DEBUG 4] Legacy mapped prescription object:", prescription);
  } else {
    console.log("[SERVICE DEBUG 3] Processing new/direct Pascal format call.");
    prescription = arg1 as Partial<PrescriptionPascal>;
    console.log("[SERVICE DEBUG 4] Direct prescription object:", prescription);
  }

  // Ensure CompanyID and BranchID are present
  if (!prescription.CompanyID) {
    prescription.CompanyID = currentCompanyId || 'COMP-default';
  }
  if (!prescription.BranchID) {
    prescription.BranchID = currentBranchId || 'BR-default';
  }
  console.log("[SERVICE DEBUG 5] Resolved company ID & branch ID:", prescription.CompanyID, prescription.BranchID);

  let result: PrescriptionPascal;
  try {
    const isNew = !prescription.PrescriptionID || !prescription.PrescriptionID.startsWith('PRE-');
    console.log("[SERVICE DEBUG 6] PrescriptionID:", prescription.PrescriptionID, "isNew:", isNew);
    
    const actionName = isNew ? "Create Prescription (createPrescription API)" : "Update Prescription (updatePrescription API)";
    console.log("----------------- PRESCRIPTION SERVICE: API CALL INITIATION -----------------");
    console.log("[savePrescription apiCall] Action:", actionName);
    console.log("[savePrescription apiCall] CustomerID:", prescription.CustomerID);
    console.log("[savePrescription apiCall] PrescriptionID:", prescription.PrescriptionID || "NEW_PRESCRIPTION");
    console.log("[savePrescription apiCall] CompanyID:", prescription.CompanyID);
    console.log("[savePrescription apiCall] BranchID:", prescription.BranchID);
    console.log("[savePrescription apiCall] Full Payload:", JSON.stringify(prescription, null, 2));
    console.log("-----------------------------------------------------------------------------");

    if (isNew) {
      console.log("[SERVICE DEBUG 7] Executing createPrescription API...");
      const res = await apiCall<any>('createPrescription', { prescription });
      console.log("[SERVICE DEBUG 8] createPrescription API response raw:", res);
      result = mapRawToPascal(res.data || res);
      console.log("[SERVICE DEBUG 9] Mapped create response:", result);
    } else {
      console.log("[SERVICE DEBUG 7] Executing updatePrescription API...");
      const res = await apiCall<any>('updatePrescription', { prescription });
      console.log("[SERVICE DEBUG 8] updatePrescription API response raw:", res);
      result = mapRawToPascal(res.data || res);
      console.log("[SERVICE DEBUG 9] Mapped update response:", result);
    }
  } catch (e) {
    console.warn('[SERVICE DEBUG ERROR] Remote savePrescription failed, fallback to local save:', e);
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
      Source: prescription.Source || 'Eye Test Performed In Shop',
      CreatedDate: prescription.CreatedDate || Date.now(),
    };
    console.log("[SERVICE DEBUG 10] Created fallback result:", result);
  }

  // Sync to local customer list cache
  console.log("[SERVICE DEBUG 11] Syncing saved prescription to local cache for customer ID:", result.CustomerID);
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
    console.log("[SERVICE DEBUG 12] Local customer cache sync complete!");
  } else {
    console.warn("[SERVICE DEBUG WARNING] Customer with ID not found in local list to update:", customerId);
  }

  console.log("Return value:", result);
  console.log("EXIT prescriptionService.savePrescription");
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
        return data.map(mapRawToPascal);
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
      Source: p.source || 'Eye Test Performed In Shop',
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
