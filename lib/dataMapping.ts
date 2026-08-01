import { Customer, EyeTestDetails, Invoice, OrderItem, Prescription, InventoryItem } from "./types";

export function normalizeCustomer(c: any): Customer {
  if (!c) return {} as Customer;
  return {
    id: String(c.id || c.CustomerID || c.customerid || c.customerId || ''),
    name: String(c.name || c.Name || c.CustomerName || c.customerName || ''),
    mobile: String(c.mobile || c.Mobile || c.mobilenumber || c.mobileNumber || ''),
    dob: c.dob || c.DOB || c.dateofbirth || c.dateOfBirth || '',
    address: c.address || c.Address || '',
    status: c.status || c.Status || 'Buyer',
    prescriptions: Array.isArray(c.prescriptions || c.Prescriptions) ? (c.prescriptions || c.Prescriptions).map(normalizePrescription) : [],
    createdAt: Number(c.createdAt || c.CreatedAt || c.createdDate || c.CreatedDate || Date.now())
  };
}

export function normalizePrescription(p: any): any {
  if (!p) return {} as Prescription;
  return {
    id: p.id || p.PrescriptionID || p.prescriptionId || '',
    source: p.source || p.Source || 'Eye Test Performed In Shop',
    
    // Flat properties for compatibility with EyeTestRecord/UI Forms
    sphOd: p.sphOd || p.OD_Distance_SPH || p.oD_Distance_SPH || p.rightEye?.sph || '',
    cylOd: p.cylOd || p.OD_Distance_CYL || p.oD_Distance_CYL || p.rightEye?.cyl || '',
    axisOd: p.axisOd || p.OD_Distance_AXIS || p.oD_Distance_AXIS || p.rightEye?.axis || '',
    sphOs: p.sphOs || p.OS_Distance_SPH || p.oS_Distance_SPH || p.leftEye?.sph || '',
    cylOs: p.cylOs || p.OS_Distance_CYL || p.oS_Distance_CYL || p.leftEye?.cyl || '',
    axisOs: p.axisOs || p.OS_Distance_AXIS || p.oS_Distance_AXIS || p.leftEye?.axis || '',
    addPower: p.addPower || p.AddPower || p.rightEye?.add || p.leftEye?.add || '',
    optometristName: p.optometristName || p.DoctorName || p.doctorName || p.eyeTestDetails?.optometristName || '',
    eyeTestDate: p.eyeTestDate || p.ExamDate || p.examDate || p.eyeTestDetails?.eyeTestDate || '',
    complaint: p.complaint || p.Complaint || '',
    diagnosis: p.diagnosis || p.Diagnosis || '',
    advice: p.advice || p.Advice || '',

    rightEye: p.rightEye || {
      sph: p.sphOd || p.OD_Distance_SPH || p.oD_Distance_SPH || '',
      cyl: p.cylOd || p.OD_Distance_CYL || p.oD_Distance_CYL || '',
      axis: p.axisOd || p.OD_Distance_AXIS || p.oD_Distance_AXIS || '',
      add: p.addPower || p.AddPower || '',
    },
    leftEye: p.leftEye || {
      sph: p.sphOs || p.OS_Distance_SPH || p.oS_Distance_SPH || '',
      cyl: p.cylOs || p.OS_Distance_CYL || p.oS_Distance_CYL || '',
      axis: p.axisOs || p.OS_Distance_AXIS || p.oS_Distance_AXIS || '',
      add: p.addPower || p.AddPower || '',
    },
    pdDistance: p.pdDistance || p.PD_Distance || p.pD_Distance || '',
    pdNear: p.pdNear || p.PD_Near || p.pD_Near || '',
    remarks: p.remarks || p.Remarks || '',
    eyeTestDetails: p.eyeTestDetails || {
      optometristName: p.optometristName || p.DoctorName || p.doctorName || '',
      eyeTestDate: p.eyeTestDate || p.ExamDate || p.examDate || '',
      remarks: p.remarks || p.Remarks || '',
    },
    doctorPrescriptionDetails: p.doctorPrescriptionDetails || {
      doctorName: p.doctorName || p.DoctorName || '',
      prescriptionDate: p.prescriptionDate || p.ExamDate || p.examDate || '',
      remarks: p.remarks || p.Remarks || '',
    },
    createdAt: Number(p.createdAt || p.CreatedDate || p.createdDate || Date.now())
  };
}

export function normalizeEyeTest(et: any): any {
  if (!et) return {};
  return {
    id: String(et.id || et.EyeTestID || et.eyeTestId || et.EyeTestId || ''),
    customerId: String(et.customerId || et.CustomerID || et.customerid || ''),
    companyId: String(et.companyId || et.CompanyID || et.companyid || ''),
    branchId: String(et.branchId || et.BranchID || et.branchid || ''),
    eyeTestDate: String(et.eyeTestDate || et.EyeTestDate || et.eyetestdate || ''),
    optometristName: String(et.optometristName || et.OptometristName || et.optometristname || ''),
    sphOd: String(et.sphOd || et.SphOd || et.sphod || et.OD_Distance_SPH || ''),
    cylOd: String(et.cylOd || et.CylOd || et.cylod || et.OD_Distance_CYL || ''),
    axisOd: String(et.axisOd || et.AxisOd || et.axisod || et.OD_Distance_AXIS || ''),
    sphOs: String(et.sphOs || et.SphOs || et.sphos || et.OS_Distance_SPH || ''),
    cylOs: String(et.cylOs || et.CylOs || et.cylos || et.OS_Distance_CYL || ''),
    axisOs: String(et.axisOs || et.AxisOs || et.axisos || et.OS_Distance_AXIS || ''),
    addPower: String(et.addPower || et.AddPower || et.addpower || ''),
    pdDistance: String(et.pdDistance || et.PdDistance || et.pddistance || et.PD_Distance || ''),
    pdNear: String(et.pdNear || et.PdNear || et.pdnear || et.PD_Near || ''),
    remarks: String(et.remarks || et.Remarks || ''),
    lensRecommendation: String(et.lensRecommendation || et.LensRecommendation || et.Advice || et.advice || ''),
    createdAt: Number(et.createdAt || et.CreatedAt || et.CreatedDate || Date.now()),
    updatedAt: Number(et.updatedAt || et.UpdatedAt || Date.now())
  };
}

export function normalizeInvoice(inv: any): Invoice {
  if (!inv) return {} as Invoice;
  
  let parsedItems = [];
  try {
    parsedItems = typeof inv.Items === 'string' ? JSON.parse(inv.Items) : (inv.Items || inv.items || []);
  } catch (e) {
    parsedItems = [];
  }
  if (typeof parsedItems === 'string') {
     try { parsedItems = JSON.parse(parsedItems); } catch(e) {}
  }
  
  if (!Array.isArray(parsedItems)) parsedItems = [];

  const invoiceNumber = String(inv.InvoiceNumber || inv.invoiceNumber || inv.InvoiceID || inv.id || inv.InvoiceNo || '');
  
  const resolveDate = (val: any) => {
    if (!val) return Date.now();
    const n = Number(val);
    if (!isNaN(n)) return n;
    const d = new Date(val).getTime();
    return isNaN(d) ? Date.now() : d;
  };

  return {
    id: String(inv.InvoiceID || inv.id || inv.Id || inv.ID || ''),
    invoiceNumber: invoiceNumber,
    type: inv.InvoiceType || inv.type || inv.Type || inv.invoiceType || 'Direct Sale',
    customerId: String(inv.CustomerID || inv.customerId || inv.CustomerId || ''),
    prescriptionId: String(inv.PrescriptionID || inv.prescriptionId || ''),
    items: parsedItems,
    subTotal: Number(inv.SubTotal || inv.subTotal || 0),
    totalDiscount: Number(inv.Discount || inv.totalDiscount || inv.discount || 0),
    grandTotal: Number(inv.GrandTotal || inv.grandTotal || 0),
    paymentMode: inv.PaymentMode || inv.paymentMode || 'Cash',
    paymentDetail: inv.paymentDetail || {
      cash: Number(inv.CashAmount || inv.cashAmount || 0),
      upi: Number(inv.UPIAmount || inv.upiAmount || 0),
      card: Number(inv.CardAmount || inv.cardAmount || 0),
      total: Number(inv.CashAmount || inv.cashAmount || 0) + Number(inv.UPIAmount || inv.upiAmount || 0) + Number(inv.CardAmount || inv.cardAmount || 0),
      cardLast4: inv.CardReference || inv.cardReference || '',
      upiTransactionId: inv.UPIReference || inv.upiReference || '',
      remarks: inv.BillingRemarks || inv.billingRemarks || ''
    },
    advanceAmount: Number(inv.Advance || inv.advanceAmount || inv.advance || 0),
    balanceAmount: Number(inv.Balance || inv.balanceAmount || inv.balance || 0),
    status: inv.Status || inv.status || 'Delivered',
    createdAt: resolveDate(inv.CreatedDate || inv.createdAt || inv.CreatedAt),
    updatedAt: resolveDate(inv.UpdatedAt || inv.updatedAt)
  };
}

export function normalizeStockItem(item: any): any {
  if (!item) return {};
  return {
    id: String(item.id || item.InventoryID || item.inventoryId || item.inventoryid || item.StockID || item.stockId || ''),
    category: String(item.category || item.Category || 'Other Products'),
    brand: String(item.brand || item.Brand || ''),
    modelNumber: String(item.modelNumber || item.ModelNumber || item.model || item.Model || ''),
    barcode: String(item.barcode || item.Barcode || ''),
    purchasePrice: Number(item.purchasePrice || item.PurchasePrice || 0),
    sellingPrice: Number(item.sellingPrice || item.SellingPrice || item.price || item.Price || 0),
    quantity: Number(item.quantity || item.Quantity || item.stock || item.Stock || 0),
    supplierName: String(item.supplierName || item.SupplierName || ''),
    purchaseDate: String(item.purchaseDate || item.PurchaseDate || ''),
    remarks: String(item.remarks || item.Remarks || ''),
    branch: String(item.branch || item.Branch || item.BranchID || item.branchId || ''),
    lensType: item.lensType || item.LensType || undefined,
    createdAt: Number(item.createdAt || item.CreatedAt || Date.now())
  };
}
