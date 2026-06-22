export type PrescriptionSource = 'Eye Test Performed In Shop' | 'Doctor Prescription' | 'Copy Old Glass Power' | 'No Prescription';

export type EyePower = {
  sph?: string;
  cyl?: string;
  axis?: string;
  add?: string;
  va?: string;
};

export type OldGlassPower = {
  rightEye?: EyePower;
  leftEye?: EyePower;
  remarks?: string;
};

export type EyeTestDetails = {
  optometristName?: string;
  eyeTestDate?: string;
  visionOd?: string;
  visionOs?: string;
  autoRefractionOd?: string;
  autoRefractionOs?: string;
  finalRefractionOd?: string;
  finalRefractionOs?: string;
  remarks?: string;
};

export type DoctorPrescriptionDetails = {
  doctorName?: string;
  clinicName?: string;
  prescriptionDate?: string;
  prescriptionNumber?: string;
  remarks?: string;
  attachmentData?: string;
};

export type Prescription = {
  id: string;
  source: PrescriptionSource;
  rightEye?: EyePower;
  leftEye?: EyePower;
  pdDistance?: string;
  pdNear?: string;
  remarks?: string;
  oldGlassPower?: OldGlassPower;
  eyeTestDetails?: EyeTestDetails;
  doctorPrescriptionDetails?: DoctorPrescriptionDetails;
  createdAt: number;
};

export type CustomerStatus = 'Eye Test Only' | 'Prescription Only' | 'Buyer' | 'Sales Order Customer';

export type Customer = {
  id: string;
  name: string;
  mobile: string;
  dob?: string;
  address?: string;
  status?: CustomerStatus;
  prescriptions?: Prescription[];
  createdAt: number;
};

export type ProductType = 
  | 'Optical Frame' | 'Sunglass' | 'Contact Lens' | 'Reading Glass' 
  | 'Safety Glass' | 'Computer Glass' | 'Accessories' | 'Eye Test Consultation' 
  | 'Repair Charge' | 'Service Charge' | 'Other';

export type LensCategory = 'Single Vision' | 'Bifocal' | 'Progressive' | 'Blue Cut' | 'Photochromic' | 'Anti Glare' | 'High Index' | 'Polycarbonate' | 'Office Lens' | 'Kids Lens' | 'Driving Lens' | 'Other';
export type LensBrand = 'Essilor' | 'Crizal' | 'Kodak' | 'Zeiss' | 'Hoya' | 'Prime' | 'GKB' | 'Vision Rx' | 'Local Brand' | 'Other';
export type LensFeature = 'Blue Cut' | 'UV Protection' | 'Anti Glare' | 'Scratch Resistant' | 'Photochromic' | 'Progressive' | 'Water Repellent' | 'Dust Resistant' | 'Digital Protection' | 'Polarized' | 'High Index' | 'Other';

export type OrderItem = {
  id: string;
  itemType: 'frame' | 'lens' | 'manual';
  
  // Frame fields
  productType?: ProductType;
  brand?: string;
  modelNumber?: string;
  color?: string;
  
  // Lens fields
  lensCategory?: LensCategory;
  lensBrand?: LensBrand;
  lensFeatures?: LensFeature[];
  
  // Manual fields
  itemName?: string;
  description?: string;
  
  // Common
  quantity: number;
  sellingPrice: number;
  discount: number;
  finalAmount: number;
};

export type PaymentMode = 'Cash' | 'UPI' | 'Card' | 'Mixed';

export type PaymentDetail = {
  cash: number;
  upi: number;
  card: number;
  total: number;
  cardType?: string;
  cardLast4?: string;
  upiApp?: string;
  upiTransactionId?: string;
  referenceNumber?: string;
  remarks?: string;
};

export type OrderStatus = 'Ordered' | 'In Lab' | 'Ready' | 'Delivered' | 'Cancelled';
export type InvoiceType = 'Direct Sale' | 'Sales Order';

export type Invoice = {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  customerId: string;
  prescriptionId?: string;
  items: OrderItem[];
  subTotal: number;
  totalDiscount: number;
  grandTotal: number;
  paymentMode: PaymentMode;
  paymentDetail: PaymentDetail;
  advanceAmount: number;
  balanceAmount: number;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
  deliveryDate?: number;
  finalCollectionPaymentMode?: PaymentMode;
  finalCollectionPaymentDetail?: PaymentDetail;
};

export type InventoryItem = {
  id: string;
  itemType: 'frame' | 'lens';
  customCategory?: string;
  brand: string;
  modelNumber: string;
  price: number;
  stock: number;
};

export type StockCategory = 
  | 'Frames' 
  | 'Sunglasses' 
  | 'Optical Lenses' 
  | 'Contact Lenses' 
  | 'Accessories' 
  | 'Eye Drops' 
  | 'Cleaning Solutions' 
  | 'Other Products';

export type LensType = 
  | 'Single Vision' 
  | 'Bifocal' 
  | 'Progressive' 
  | 'Blue Cut' 
  | 'Photochromic' 
  | 'Anti Glare' 
  | 'High Index' 
  | 'Other';

export type StockItem = {
  id: string;
  category: StockCategory;
  brand: string;
  modelNumber: string;
  barcode: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  supplierName: string;
  purchaseDate: string;
  remarks: string;
  branch: string; // e.g., 'Main Branch', 'City Center Branch', 'Metro Mall Branch'
  lensType?: LensType; // tracked separately for Lens Inventory
  createdAt: number;
};

export type StockAdjustmentReason = 
  | 'Purchase' 
  | 'Damage' 
  | 'Return' 
  | 'Transfer' 
  | 'Correction' 
  | 'Lost Item';

export type StockAdjustment = {
  id: string;
  productId: string; // references StockItem.id
  type: 'Add' | 'Remove';
  quantity: number;
  reason: StockAdjustmentReason;
  date: number;
  remarks: string;
  adjustedBy: string; // e.g., 'Admin'
};

export type BranchTransfer = {
  id: string;
  productId: string;
  brand: string;
  modelNumber: string;
  barcode: string;
  category: StockCategory;
  quantity: number;
  fromBranch: string;
  toBranch: string;
  reason: string;
  date: number;
  transferredBy: string;
};

