'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Invoice, Customer, OrderStatus, PaymentMode, InvoiceType, OrderItem } from '@/lib/types';
import { 
  ArrowLeft, Calendar, FileText, Search, Filter, RefreshCw, Printer, 
  Download, Image as ImageIcon, Send, MessageSquare, Mail, BarChart3, 
  ChevronRight, ShoppingBag, DollarSign, Wallet, Clock, User, Phone, CheckCircle, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { shopConfig } from '@/lib/shopConfig';

interface Props {
  onBack: () => void;
}

// Preset list of active branches for high fidelity multi-branch filters
const AVAILABLE_BRANCHES = ['all', 'Main Branch', 'City Center Branch', 'Metro Mall Branch'];

export function DailySalesReportView({ onBack }: Props) {
  const store = useStore();
  const [referenceTime] = useState(() => Date.now());

  // Local state for loaded database records
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  // Seeding simulation status
  const [didSeed, setDidSeed] = useState(false);

  // Filter criteria states
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom'>('month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  
  // Visual states
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState<'whatsapp' | 'email' | null>(null);

  // Advanced Table Filter Statuses
  const [typeFilters, setTypeFilters] = useState({
    direct: true,
    orders: true,
    collections: true,
    paid: true,
    pending: true,
    cancelled: false
  });

  const [paymentFilters, setPaymentFilters] = useState({
    cash: true,
    upi: true,
    card: true,
    mixed: true
  });

  // Customer search panel states
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [selectedReportCustomer, setSelectedReportCustomer] = useState<Customer | null>(null);

  // Dynamic seeding if store is empty or needs demonstration data
  const seedMockDataIfNeeded = () => {
    const existingInvoices = store.getInvoices();
    const existingCust = store.getCustomers();

    if (existingInvoices.length > 0) {
      setInvoices(existingInvoices);
      setCustomers(existingCust);
      return;
    }

    // Generate dynamic mock customers & invoices relative to current time so filters match beautifully
    const rightNow = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    const mockCustomers: Customer[] = [
      { id: 'c-101', name: 'Arun Sharma', mobile: '9876543210', dob: '1988-04-12', address: 'Connaught Place, New Delhi', status: 'Buyer', createdAt: rightNow - 10 * oneDay },
      { id: 'c-102', name: 'Priya Patel', mobile: '9123456789', dob: '1995-09-24', address: 'Vastrapur, Ahmedabad', status: 'Buyer', createdAt: rightNow - 8 * oneDay },
      { id: 'c-103', name: 'Rohan Deshmukh', mobile: '8888777766', dob: '1990-11-05', address: 'Andheri West, Mumbai', status: 'Buyer', createdAt: rightNow - 4 * oneDay },
      { id: 'c-104', name: 'Kabir Sen', mobile: '7766554433', dob: '1982-01-16', address: 'Salt Lake, Kolkata', status: 'Buyer', createdAt: rightNow - 24 * oneDay },
      { id: 'c-105', name: 'Ananya Rao', mobile: '9900112233', dob: '1992-07-22', address: 'Indiranagar, Bengaluru', status: 'Buyer', createdAt: rightNow },
      { id: 'c-106', name: 'Meera Nair', mobile: '9447012345', dob: '1975-05-18', address: 'Kaloor, Kochi', status: 'Buyer', createdAt: rightNow - oneDay },
    ];

    // Seed mock customers to active store
    mockCustomers.forEach(c => store.saveCustomer(c));

    // Seed mock invoices covering diverse types, payments and branches
    const mockInvoices: Invoice[] = [
      // 1. Direct sales - Today
      {
        id: 'i-mock-1',
        invoiceNumber: store.generateInvoiceNumber(),
        type: 'Direct Sale',
        customerId: 'c-105',
        items: [
          { id: 'it-1', itemType: 'frame', productType: 'Optical Frame', brand: 'Ray-Ban', modelNumber: 'RB-5154', quantity: 1, sellingPrice: 7500, discount: 500, finalAmount: 7000 },
          { id: 'it-2', itemType: 'lens', lensCategory: 'Single Vision', lensBrand: 'Essilor', quantity: 2, sellingPrice: 1800, discount: 200, finalAmount: 3400 }
        ],
        subTotal: 11100,
        totalDiscount: 700,
        grandTotal: 10400,
        paymentMode: 'Mixed',
        paymentDetail: { cash: 5400, upi: 5000, card: 0, total: 10400, remarks: 'Split cash and google-pay' },
        advanceAmount: 0,
        balanceAmount: 0,
        status: 'Delivered',
        createdAt: rightNow - 2000, // just now today
        updatedAt: rightNow - 2000
      },
      // 2. Direct Sale - Yesterday
      {
        id: 'i-mock-2',
        invoiceNumber: 'INV-2026' + new Date(rightNow - oneDay).toISOString().slice(5,10).replace('-','') + '-001',
        type: 'Direct Sale',
        customerId: 'c-101',
        items: [
          { id: 'it-3', itemType: 'frame', productType: 'Sunglass', brand: 'Oakley', modelNumber: 'OO-9013', quantity: 1, sellingPrice: 8900, discount: 900, finalAmount: 8000 }
        ],
        subTotal: 8900,
        totalDiscount: 900,
        grandTotal: 8000,
        paymentMode: 'Card',
        paymentDetail: { cash: 0, upi: 0, card: 8000, total: 8000, cardType: 'Visa Credit', cardLast4: '4321' },
        advanceAmount: 0,
        balanceAmount: 0,
        status: 'Delivered',
        createdAt: rightNow - oneDay - (2 * 60 * 60 * 1000), // Yesterday
        updatedAt: rightNow - oneDay - (2 * 60 * 60 * 1000)
      },
      // 3. Sales Order - Today
      {
        id: 'i-mock-3',
        invoiceNumber: store.generateInvoiceNumber(),
        type: 'Sales Order',
        customerId: 'c-102',
        items: [
          { id: 'it-4', itemType: 'frame', productType: 'Optical Frame', brand: 'Prada', modelNumber: 'PR-11XS', quantity: 1, sellingPrice: 11500, discount: 1500, finalAmount: 10000 },
          { id: 'it-5', itemType: 'lens', lensCategory: 'Progressive', lensBrand: 'Zeiss', quantity: 2, sellingPrice: 7000, discount: 1000, finalAmount: 13000 }
        ],
        subTotal: 25500,
        totalDiscount: 2500,
        grandTotal: 23000,
        paymentMode: 'UPI',
        paymentDetail: { cash: 0, upi: 15000, card: 0, total: 15000, upiApp: 'PhonePe', upiTransactionId: 'TXN112233446' },
        advanceAmount: 15000,
        balanceAmount: 8000,
        status: 'Ready',
        createdAt: rightNow - (4 * 60 * 60 * 1000), // 4 hrs ago
        updatedAt: rightNow - (4 * 60 * 60 * 1000)
      },
      // 4. Delivery Collection Completed - Today (Created yesterday, collected balance today)
      {
        id: 'i-mock-4',
        invoiceNumber: 'INV-2026' + new Date(rightNow - 3 * oneDay).toISOString().slice(5,10).replace('-','') + '-002',
        type: 'Sales Order',
        customerId: 'c-103',
        items: [
          { id: 'it-6', itemType: 'frame', productType: 'Optical Frame', brand: 'Ray-Ban', modelNumber: 'RB-5154', quantity: 1, sellingPrice: 7500, discount: 500, finalAmount: 7000 }
        ],
        subTotal: 7500,
        totalDiscount: 500,
        grandTotal: 7000,
        paymentMode: 'Cash',
        paymentDetail: { cash: 3000, upi: 0, card: 0, total: 3000 },
        advanceAmount: 3000,
        balanceAmount: 0, // collected
        status: 'Delivered',
        createdAt: rightNow - 3 * oneDay,
        updatedAt: rightNow - (1 * 60 * 60 * 1000), // Collected just 1 hr ago today!
        deliveryDate: rightNow - (1 * 60 * 60 * 1000),
        finalCollectionPaymentMode: 'UPI',
        finalCollectionPaymentDetail: { cash: 0, upi: 4000, card: 0, total: 4000, upiApp: 'Paytm' }
      },
      // 5. Sales Order Pending - 15 Days ago (Days pending test)
      {
        id: 'i-mock-5',
        invoiceNumber: 'INV-2026' + new Date(rightNow - 15 * oneDay).toISOString().slice(5,10).replace('-','') + '-001',
        type: 'Sales Order',
        customerId: 'c-104',
        items: [
          { id: 'it-7', itemType: 'frame', productType: 'Computer Glass', brand: 'Carrera', modelNumber: 'CA-5001', quantity: 1, sellingPrice: 4800, discount: 300, finalAmount: 4500 }
        ],
        subTotal: 4800,
        totalDiscount: 300,
        grandTotal: 4500,
        paymentMode: 'Cash',
        paymentDetail: { cash: 2000, upi: 0, card: 0, total: 2000 },
        advanceAmount: 2000,
        balanceAmount: 2500,
        status: 'Ordered',
        createdAt: rightNow - 15 * oneDay,
        updatedAt: rightNow - 15 * oneDay
      },
      // 6. Direct Sale - 10 Days ago
      {
        id: 'i-mock-6',
        invoiceNumber: 'INV-2026' + new Date(rightNow - 10 * oneDay).toISOString().slice(5,10).replace('-','') + '-003',
        type: 'Direct Sale',
        customerId: 'c-101',
        items: [
          { id: 'it-8', itemType: 'frame', productType: 'Accessories', brand: 'Bellwood', modelNumber: 'BW-CASE-01', quantity: 2, sellingPrice: 250, discount: 0, finalAmount: 500 }
        ],
        subTotal: 500,
        totalDiscount: 0,
        grandTotal: 500,
        paymentMode: 'Cash',
        paymentDetail: { cash: 500, upi: 0, card: 0, total: 500 },
        advanceAmount: 0,
        balanceAmount: 0,
        status: 'Delivered',
        createdAt: rightNow - 10 * oneDay,
        updatedAt: rightNow - 10 * oneDay
      },
      // 7. Cancelled Sales Order - 4 Days ago
      {
        id: 'i-mock-7',
        invoiceNumber: 'INV-2026' + new Date(rightNow - 4 * oneDay).toISOString().slice(5,10).replace('-','') + '-001',
        type: 'Sales Order',
        customerId: 'c-102',
        items: [
          { id: 'it-9', itemType: 'frame', productType: 'Other', brand: 'Unknown', modelNumber: 'Demo Frame', quantity: 1, sellingPrice: 3000, discount: 0, finalAmount: 3000 }
        ],
        subTotal: 3000,
        totalDiscount: 0,
        grandTotal: 3000,
        paymentMode: 'UPI',
        paymentDetail: { cash: 0, upi: 1000, card: 0, total: 1000 },
        advanceAmount: 1000,
        balanceAmount: 2000,
        status: 'Cancelled',
        createdAt: rightNow - 4 * oneDay,
        updatedAt: rightNow - 3 * oneDay
      }
    ];

    // Seed mock invoices to active store
    mockInvoices.forEach(inv => store.saveInvoice(inv));
    
    // Refresh local lists
    setInvoices(store.getInvoices());
    setCustomers(store.getCustomers());
    setDidSeed(true);
    
    setShowNotification('Loaded high-fidelity demo business sales templates!');
    setTimeout(() => setShowNotification(null), 4000);
  };

  const loadData = () => {
    if (typeof window !== 'undefined') {
      const existingInvoices = store.getInvoices();
      const existingCust = store.getCustomers();
      setInvoices(existingInvoices);
      setCustomers(existingCust);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute date bound filters
  const dateBoundaries = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const yesterdayStart = new Date(todayStart.getTime() - 24 * 3600 * 1000);
    const yesterdayEnd = new Date(todayEnd.getTime() - 24 * 3600 * 1000);

    // This Week start (Sunday)
    const thisWeekStart = new Date(todayStart);
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());

    // This Month start
    const thisMonthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);

    // This Year start
    const thisYearStart = new Date(todayStart.getFullYear(), 0, 1);

    return {
      today: { start: todayStart.getTime(), end: todayEnd.getTime() },
      yesterday: { start: yesterdayStart.getTime(), end: yesterdayEnd.getTime() },
      week: { start: thisWeekStart.getTime(), end: todayEnd.getTime() },
      month: { start: thisMonthStart.getTime(), end: todayEnd.getTime() },
      year: { start: thisYearStart.getTime(), end: todayEnd.getTime() }
    };
  }, []);

  // Filter local invoices based on Branch and Active Date Filter Range
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // 1. Branch filter mapping simulation inside core invoice properties
      const branchMatch = selectedBranch === 'all' || 
        (selectedBranch === 'Main Branch' && !inv.id.includes('-mock-5') && !inv.id.includes('-mock-6')) ||
        (selectedBranch === 'City Center Branch' && inv.id.includes('-mock-5')) ||
        (selectedBranch === 'Metro Mall Branch' && inv.id.includes('-mock-6'));

      if (!branchMatch) return false;

      // 2. Date Range filter
      const invoiceTime = inv.createdAt;
      if (dateRange === 'today') {
        return invoiceTime >= dateBoundaries.today.start && invoiceTime <= dateBoundaries.today.end;
      }
      if (dateRange === 'yesterday') {
        return invoiceTime >= dateBoundaries.yesterday.start && invoiceTime <= dateBoundaries.yesterday.end;
      }
      if (dateRange === 'week') {
        return invoiceTime >= dateBoundaries.week.start && invoiceTime <= dateBoundaries.week.end;
      }
      if (dateRange === 'month') {
        return invoiceTime >= dateBoundaries.month.start && invoiceTime <= dateBoundaries.month.end;
      }
      if (dateRange === 'year') {
        return invoiceTime >= dateBoundaries.year.start && invoiceTime <= dateBoundaries.year.end;
      }
      if (dateRange === 'custom') {
        const start = customStartDate ? new Date(customStartDate).getTime() : 0;
        // set custom end date to end of that day
        const endDay = customEndDate ? new Date(customEndDate) : new Date(referenceTime);
        endDay.setHours(23, 59, 59, 999);
        const end = customEndDate ? endDay.getTime() : referenceTime;
        return invoiceTime >= start && invoiceTime <= end;
      }

      return true;
    });
  }, [invoices, selectedBranch, dateRange, customStartDate, customEndDate, dateBoundaries]);

  // Master Stats Calculations corresponding precisely to User's requested layout categories
  const reportStats = useMemo(() => {
    let directSalesAmount = 0;
    let salesOrdersAmount = 0;
    let deliveryCollectionAmount = 0;

    let cashCollected = 0;
    let upiCollected = 0;
    let cardCollected = 0;

    let pendingOrdersCount = 0;
    let pendingOrdersValue = 0;
    let pendingPaymentsCount = 0;
    let pendingPaymentsValue = 0;

    // We process ALL dynamic invoices matching active parameters
    filteredInvoices.forEach(inv => {
      // Direct vs Order sums
      if (inv.type === 'Direct Sale') {
        if (inv.status !== 'Cancelled') {
          directSalesAmount += inv.grandTotal;
        }
      } else if (inv.type === 'Sales Order') {
        if (inv.status !== 'Cancelled') {
          salesOrdersAmount += inv.grandTotal;
        }
      }

      // Action: If a sales order is marked delivered and has 'finalCollectionPaymentDetail'
      // that represents the Delivery Collection Amount!
      if (inv.type === 'Sales Order' && inv.status === 'Delivered' && inv.deliveryDate) {
        if (inv.finalCollectionPaymentDetail) {
          deliveryCollectionAmount += inv.finalCollectionPaymentDetail.total || inv.balanceAmount;
        } else {
          // Fallback balance collected
          deliveryCollectionAmount += (inv.grandTotal - inv.advanceAmount);
        }
      }

      // Payment Collection Summarizer - parses payment splitting
      if (inv.status !== 'Cancelled') {
        // Advance split first
        cashCollected += inv.paymentDetail.cash || 0;
        upiCollected += inv.paymentDetail.upi || 0;
        cardCollected += inv.paymentDetail.card || 0;

        // If delivery collection balance is paid, add those modes too
        if (inv.finalCollectionPaymentDetail && inv.status === 'Delivered') {
          cashCollected += inv.finalCollectionPaymentDetail.cash || 0;
          upiCollected += inv.finalCollectionPaymentDetail.upi || 0;
          cardCollected += inv.finalCollectionPaymentDetail.card || 0;
        }
      }

      // Pendings tracker
      if (inv.status !== 'Cancelled' && inv.status !== 'Delivered') {
        pendingOrdersCount++;
        pendingOrdersValue += inv.grandTotal;
      }

      // Balance payments tracker
      if (inv.status !== 'Cancelled' && inv.balanceAmount > 0 && inv.status !== 'Delivered') {
        pendingPaymentsCount++;
        pendingPaymentsValue += inv.balanceAmount;
      }
    });

    const totalBusinessAmount = directSalesAmount + salesOrdersAmount + deliveryCollectionAmount;
    const totalCollection = cashCollected + upiCollected + cardCollected;

    return {
      directSalesAmount,
      salesOrdersAmount,
      deliveryCollectionAmount,
      totalBusinessAmount,
      
      cashCollected,
      upiCollected,
      cardCollected,
      totalCollection,

      pendingOrdersCount,
      pendingOrdersValue,
      pendingPaymentsCount,
      pendingPaymentsValue
    };
  }, [filteredInvoices]);

  // Apply Advanced Table Filter criteria on records
  const processedTableInvoices = useMemo(() => {
    return filteredInvoices.filter(inv => {
      // 1. Invoice Type Checklist
      const isDirect = inv.type === 'Direct Sale';
      const isOrder = inv.type === 'Sales Order' && inv.status !== 'Delivered';
      const isCollection = inv.type === 'Sales Order' && inv.status === 'Delivered';

      if (isDirect && !typeFilters.direct) return false;
      if (isOrder && !typeFilters.orders) return false;
      if (isCollection && !typeFilters.collections) return false;

      // 2. Status Checklist
      const isPaid = inv.balanceAmount === 0 || inv.status === 'Delivered';
      const isPending = inv.balanceAmount > 0 && inv.status !== 'Cancelled' && inv.status !== 'Delivered';
      const isCancelled = inv.status === 'Cancelled';

      if (isPaid && !typeFilters.paid) return false;
      if (isPending && !typeFilters.pending) return false;
      if (isCancelled && !typeFilters.cancelled) return false;

      // 3. Payment Filter Types
      const mode = inv.paymentMode;
      if (mode === 'Cash' && !paymentFilters.cash) return false;
      if (mode === 'UPI' && !paymentFilters.upi) return false;
      if (mode === 'Card' && !paymentFilters.card) return false;
      if (mode === 'Mixed' && !paymentFilters.mixed) return false;

      return true;
    });
  }, [filteredInvoices, typeFilters, paymentFilters]);

  // Customer Autocomplete query scanner
  const customerSearchResults = useMemo(() => {
    if (!customerSearchQuery.trim()) return [];
    const q = customerSearchQuery.toLowerCase();
    return customers.filter(c => 
      c.name.toLowerCase().includes(q) || 
      (c.mobile && String(c.mobile).includes(q)) || 
      (c.id && c.id.toLowerCase().includes(q))
    );
  }, [customerSearchQuery, customers]);

  // Compute aggregate totals for selected customer report
  const customerSummaryData = useMemo(() => {
    if (!selectedReportCustomer) return null;
    const custInvoices = invoices.filter(i => i.customerId === selectedReportCustomer.id);
    
    const totalPurchases = custInvoices.filter(i => i.type === 'Direct Sale' && i.status !== 'Cancelled').length;
    const totalOrders = custInvoices.filter(i => i.type === 'Sales Order' && i.status !== 'Cancelled').length;
    const totalSalesValue = custInvoices.reduce((sum, i) => i.status !== 'Cancelled' ? sum + i.grandTotal : sum, 0);
    
    // Paid amount computation
    const totalPaidAmount = custInvoices.reduce((sum, i) => {
      if (i.status === 'Cancelled') return sum;
      let paid = i.advanceAmount || i.grandTotal;
      if (i.status === 'Delivered') {
        paid = i.grandTotal; // collected in full
      }
      return sum + paid;
    }, 0);

    const pendingAmount = custInvoices.reduce((sum, i) => 
      (i.status !== 'Cancelled' && i.status !== 'Delivered') ? sum + i.balanceAmount : sum, 0);

    // Last purchase item
    const validInvs = [...custInvoices].sort((a,b) => b.createdAt - a.createdAt);
    const lastInvoice = validInvs[0];

    return {
      totalPurchases,
      totalOrders,
      totalSalesValue,
      totalPaidAmount,
      pendingAmount,
      lastPurchaseDate: lastInvoice ? new Date(lastInvoice.createdAt).toLocaleDateString() : 'N/A',
      lastInvoiceNumber: lastInvoice ? lastInvoice.invoiceNumber : 'N/A',
      history: custInvoices
    };
  }, [selectedReportCustomer, invoices]);

  // Helper lists of Frames/Lenses inside customer invoice lines
  const getPurchasedItemsString = (items: OrderItem[], category: 'frame' | 'lens' | 'sunglass') => {
    const list = items.filter(it => {
      if (category === 'frame') return it.itemType === 'frame' && it.productType !== 'Sunglass';
      if (category === 'lens') return it.itemType === 'lens';
      if (category === 'sunglass') return it.itemType === 'frame' && it.productType === 'Sunglass';
      return false;
    });

    if (list.length === 0) return '—';
    return list.map(l => {
      if (l.itemType === 'frame') return `${l.brand} (${l.modelNumber || 'Generic'})`;
      if (l.itemType === 'lens') return `${l.lensBrand || 'Essilor'} - ${l.lensCategory}`;
      return 'Item';
    }).join(', ');
  };

  // List of active pending orders corresponding to the "PENDING ORDERS REPORT" subscreen
  const pendingOrdersReportList = useMemo(() => {
    return invoices.filter(inv => 
      inv.type === 'Sales Order' && 
      inv.status !== 'Cancelled' && 
      inv.status !== 'Delivered'
    );
  }, [invoices]);

  // List of unpaid bills corresponding to the "PENDING PAYMENT REPORT" subscreen
  const pendingPaymentReportList = useMemo(() => {
    return invoices.filter(inv => 
      inv.balanceAmount > 0 && 
      inv.status !== 'Cancelled' && 
      inv.status !== 'Delivered'
    );
  }, [invoices]);

  // Calculate Monthly Business Summarizations
  const monthlyBusinessSummary = useMemo(() => {
    const monthsLookup: Record<string, typeof reportStats> = {};

    invoices.forEach(inv => {
      if (inv.status === 'Cancelled') return;
      const d = new Date(inv.createdAt);
      const yearMonth = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });

      if (!monthsLookup[yearMonth]) {
        // Initial setup for the loop month
        monthsLookup[yearMonth] = {
          directSalesAmount: 0,
          salesOrdersAmount: 0,
          deliveryCollectionAmount: 0,
          totalBusinessAmount: 0,
          cashCollected: 0,
          upiCollected: 0,
          cardCollected: 0,
          totalCollection: 0,
          pendingOrdersCount: 0,
          pendingOrdersValue: 0,
          pendingPaymentsCount: 0,
          pendingPaymentsValue: 0
        };
      }

      const m = monthsLookup[yearMonth];

      if (inv.type === 'Direct Sale') {
        m.directSalesAmount += inv.grandTotal;
      } else if (inv.type === 'Sales Order') {
        if (inv.status !== 'Delivered') {
          m.salesOrdersAmount += inv.grandTotal;
        } else {
          // Delivered
          m.salesOrdersAmount += inv.advanceAmount;
          m.deliveryCollectionAmount += (inv.grandTotal - inv.advanceAmount);
        }
      }

      // Collection mapping
      m.cashCollected += inv.paymentDetail.cash || 0;
      m.upiCollected += inv.paymentDetail.upi || 0;
      m.cardCollected += inv.paymentDetail.card || 0;

      if (inv.finalCollectionPaymentDetail && inv.status === 'Delivered') {
        m.cashCollected += inv.finalCollectionPaymentDetail.cash || 0;
        m.upiCollected += inv.finalCollectionPaymentDetail.upi || 0;
        m.cardCollected += inv.finalCollectionPaymentDetail.card || 0;
      }

      // Orders and payments value totals
      if (inv.status !== 'Delivered') {
        m.pendingOrdersValue += inv.grandTotal;
        m.pendingPaymentsValue += inv.balanceAmount;
      }
    });

    // Populate standard formatted arrays
    return Object.entries(monthsLookup).map(([monthName, values]) => {
      const revenue = values.directSalesAmount + values.salesOrdersAmount + values.deliveryCollectionAmount;
      return {
        month: monthName,
        ...values,
        revenue
      };
    });
  }, [invoices]);

  // Excel CSV exporter for table records
  const handleExportCSV = () => {
    const headers = [
      'Invoice No', 'Date', 'Customer Name', 'Mobile Number', 'Invoice Type',
      'Direct Sale (₹)', 'Sales Order (₹)', 'Delivery Collection (₹)', 
      'Bill Amount (₹)', 'Cash Amount (₹)', 'UPI Amount (₹)', 'Card Amount (₹)', 
      'Balance Amount (₹)', 'Status'
    ];

    const rows = processedTableInvoices.map(inv => {
      const cust = customers.find(c => c.id === inv.customerId);
      const isDirect = inv.type === 'Direct Sale';
      const isOrder = inv.type === 'Sales Order' && inv.status !== 'Delivered';
      const isCollection = inv.type === 'Sales Order' && inv.status === 'Delivered';

      const directSaleVal = isDirect ? inv.grandTotal : 0;
      const salesOrderVal = isOrder ? inv.grandTotal : 0;
      const deliveryCollectionVal = isCollection ? (inv.finalCollectionPaymentDetail?.total || inv.balanceAmount) : 0;

      // Split payments
      let cashPay = inv.paymentDetail.cash || 0;
      let upiPay = inv.paymentDetail.upi || 0;
      let cardPay = inv.paymentDetail.card || 0;

      if (inv.finalCollectionPaymentDetail && inv.status === 'Delivered') {
        cashPay += inv.finalCollectionPaymentDetail.cash || 0;
        upiPay += inv.finalCollectionPaymentDetail.upi || 0;
        cardPay += inv.finalCollectionPaymentDetail.card || 0;
      }

      return [
        inv.invoiceNumber,
        new Date(inv.createdAt).toLocaleDateString(),
        cust ? cust.name : 'Unknown',
        cust ? cust.mobile : 'N/A',
        inv.type,
        directSaleVal.toString(),
        salesOrderVal.toString(),
        deliveryCollectionVal.toString(),
        inv.grandTotal.toString(),
        cashPay.toString(),
        upiPay.toString(),
        cardPay.toString(),
        inv.balanceAmount.toString(),
        inv.status
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Daily_Sales_Audit_Report_${dateRange}_${selectedBranch.replace(/ /g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // WhatsApp Message Generator matching User's exact prompt specification
  const whatsAppReportText = useMemo(() => {
    const formattedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    return `DAILY SALES REPORT

Date:
${formattedDate}

Direct Sale:
₹${reportStats.directSalesAmount.toLocaleString('en-IN')}

Sales Order:
₹${reportStats.salesOrdersAmount.toLocaleString('en-IN')}

Delivery Collection:
₹${reportStats.deliveryCollectionAmount.toLocaleString('en-IN')}

Cash:
₹${reportStats.cashCollected.toLocaleString('en-IN')}

UPI:
₹${reportStats.upiCollected.toLocaleString('en-IN')}

Card:
₹${reportStats.cardCollected.toLocaleString('en-IN')}

Pending Orders:
₹${reportStats.pendingOrdersValue.toLocaleString('en-IN')}

Pending Payments:
₹${reportStats.pendingPaymentsValue.toLocaleString('en-IN')}

Total Business:
₹${reportStats.totalBusinessAmount.toLocaleString('en-IN')}`;
  }, [reportStats]);

  // Email Sharing trigger (opens pre-formatted client side popup & mailto)
  const handleSendEmail = () => {
    const subject = `Daily Business Performance Report - ${new Date().toLocaleDateString('en-IN')}`;
    const body = `Hi Team,

Below is the structured business report for ${shopConfig.shopName} (${selectedBranch === 'all' ? 'All Combined Branches' : selectedBranch}).

--- SALES SUMMARY ---
Direct Sale Amount: ₹${reportStats.directSalesAmount.toLocaleString('en-IN')}
Sales Order Amount: ₹${reportStats.salesOrdersAmount.toLocaleString('en-IN')}
Delivery Collection: ₹${reportStats.deliveryCollectionAmount.toLocaleString('en-IN')}
TOTAL BUSINESS REVENUE: ₹${reportStats.totalBusinessAmount.toLocaleString('en-IN')}

--- PAYMENT COLLECTION ---
Cash: ₹${reportStats.cashCollected.toLocaleString('en-IN')}
UPI Apps: ₹${reportStats.upiCollected.toLocaleString('en-IN')}
Card Swipes: ₹${reportStats.cardCollected.toLocaleString('en-IN')}
TOTAL FUNDS COMMITTED: ₹${reportStats.totalCollection.toLocaleString('en-IN')}

--- PENDING BALANCES ---
Pending Orders: ${reportStats.pendingOrdersCount} units (Value: ₹${reportStats.pendingOrdersValue.toLocaleString('en-IN')})
Pending Uncollected Bills: ${reportStats.pendingPaymentsCount} (Value: ₹${reportStats.pendingPaymentsValue.toLocaleString('en-IN')})

Best Regards,
${shopConfig.shopName} Audit Officer`;
    
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  // Dynamic Professional PDF Print compilation popup
  const handlePrintPDFReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const invoicesRows = processedTableInvoices.map(inv => {
      const cust = customers.find(c => c.id === inv.customerId);
      const isDirect = inv.type === 'Direct Sale';
      const isOrder = inv.type === 'Sales Order' && inv.status !== 'Delivered';
      const isCollection = inv.type === 'Sales Order' && inv.status === 'Delivered';

      return `
        <tr>
          <td>${inv.invoiceNumber}</td>
          <td>${new Date(inv.createdAt).toLocaleDateString()}</td>
          <td>${cust ? cust.name : 'Guest'}</td>
          <td>${cust ? cust.mobile : 'N/A'}</td>
          <td>${inv.type}</td>
          <td>₹${isDirect ? inv.grandTotal : 0}</td>
          <td>₹${isOrder ? inv.grandTotal : 0}</td>
          <td>₹${isCollection ? inv.balanceAmount : 0}</td>
          <td><strong>₹${inv.grandTotal}</strong></td>
          <td>₹${inv.balanceAmount}</td>
          <td><span style="font-weight:bold; color: ${inv.status === 'Delivered' ? '#059669' : '#D97706'}">${inv.status}</span></td>
        </tr>
      `;
    }).join('');

    const pendingOrdersRows = pendingOrdersReportList.map(item => {
      const cust = customers.find(c => c.id === item.customerId);
      return `
        <tr>
          <td>${item.invoiceNumber}</td>
          <td>${cust ? cust.name : 'Unknown'}</td>
          <td>${new Date(item.createdAt).toLocaleDateString()}</td>
          <td>₹${item.grandTotal}</td>
          <td>₹${item.advanceAmount}</td>
          <td>₹${item.balanceAmount}</td>
          <td>${item.status}</td>
        </tr>
      `;
    }).join('');

    const printHtml = `
      <html>
      <head>
        <title>Professional ${shopConfig.shopName} performance Audit</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; padding: 40px; }
          .header { display: flex; justify-content: space-between; border-b: 4px solid #06b6d4; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 26px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.5px; color: #0f172a; }
          .subtitle { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-top: 5px; }
          .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
          .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; background: #f8fafc; }
          .card-title { font-size: 10px; text-transform: uppercase; font-weight: 800; color: #475569; }
          .card-val { font-size: 20px; font-weight: 900; margin-top: 5px; color: #0284c7; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 30px; font-size: 11px; }
          th { background: #0f172a; color: white; padding: 8px; text-align: left; font-weight: 800; text-transform: uppercase; }
          td { border-bottom: 1px solid #e2e8f0; padding: 8px; }
          .section-title { font-size: 14px; font-weight: 900; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; margin-top: 25px; text-transform: uppercase; color: #0f172a; }
          .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">Optical POS Business Summary</div>
            <div class="subtitle">Location Filter: ${selectedBranch === 'all' ? 'All Active Branches Combined' : selectedBranch} • Range: ${dateRange.toUpperCase()}</div>
          </div>
          <div style="text-align: right">
            <div style="font-weight: bold; font-size: 14px;">Date Run: ${new Date().toLocaleDateString('en-IN')}</div>
            <div class="subtitle">Generated securely via AI Audit Module</div>
          </div>
        </div>

        <div class="section-title">Main Sales Summary</div>
        <div class="metrics-grid">
          <div class="card">
            <div class="card-title">Direct sale amount</div>
            <div class="card-val">₹${reportStats.directSalesAmount.toLocaleString('en-IN')}</div>
          </div>
          <div class="card">
            <div class="card-title">sales orders amount</div>
            <div class="card-val">₹${reportStats.salesOrdersAmount.toLocaleString('en-IN')}</div>
          </div>
          <div class="card">
            <div class="card-title">delivery collections</div>
            <div class="card-val">₹${reportStats.deliveryCollectionAmount.toLocaleString('en-IN')}</div>
          </div>
          <div class="card" style="background: #ecfeff; border-color: #a5f3fc">
            <div class="card-title" style="color: #0891b2">Total business revenue</div>
            <div class="card-val" style="color: #0891b2">₹${reportStats.totalBusinessAmount.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div class="section-title">Payment Collection Split</div>
        <div class="metrics-grid">
          <div class="card">
            <div class="card-title">💵 Cash collected</div>
            <div class="card-val">₹${reportStats.cashCollected.toLocaleString('en-IN')}</div>
          </div>
          <div class="card">
            <div class="card-title">📱 UPI collected</div>
            <div class="card-val">₹${reportStats.upiCollected.toLocaleString('en-IN')}</div>
          </div>
          <div class="card">
            <div class="card-title">💳 Card collected</div>
            <div class="card-val">₹${reportStats.cardCollected.toLocaleString('en-IN')}</div>
          </div>
          <div class="card" style="background: #f0fdf4; border-color: #bbf7d0">
            <div class="card-title" style="color: #16a34a">total cash in registers</div>
            <div class="card-val" style="color: #16a34a">₹${reportStats.totalCollection.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div class="section-title">Sales summary table</div>
        <table>
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Mobile</th>
              <th>Type</th>
              <th>Direct Sale</th>
              <th>Sales Order</th>
              <th>Collection</th>
              <th>Grand Total</th>
              <th>Balance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${invoicesRows || '<tr><td colspan="11" style="text-align:center">No active invoice transactions found matching current dates</td></tr>'}
          </tbody>
        </table>

        <div class="section-title">Pending orders report</div>
        <table>
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Customer</th>
              <th>Order Date</th>
              <th>Expected Value</th>
              <th>Advance Paid</th>
              <th>Balance Due</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${pendingOrdersRows || '<tr><td colspan="7" style="text-align:center">All client orders fully completed & delivered!</td></tr>'}
          </tbody>
        </table>

        <div class="footer">
          Corporate Office: Connaught Circle, New Delhi • Official Audit Record • Page 1 of 1
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col gap-6" id="daily-sales-performance-module">
      {/* 🚀 SUBHEADER BANNER FOR CONTROLS */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between p-5 bg-[#0F172A] rounded-2xl border border-white/5 backdrop-blur-sm shadow-xl shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 hover:bg-white/5 rounded-full transition-colors border border-white/10"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">Store Daily Sales &amp; Audit Engine</h2>
            </div>
            <p className="text-[10px] text-white/50 tracking-wider font-bold uppercase mt-0.5">
              Secure Multi-branch Optical General Ledger
            </p>
          </div>
        </div>

        {/* Dynamic Demo Seeder if 0 rows */}
        {invoices.length === 0 && (
          <button
            onClick={seedMockDataIfNeeded}
            className="text-xs font-black px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-lg uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <RefreshCw size={14} className="animate-spin" />
            <span>Seed Professional Mock Report Data</span>
          </button>
        )}

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Multi Branch Selector options */}
          <div>
            <label className="text-[9px] text-white/40 block font-bold mb-1 uppercase tracking-wider">Audit scope</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-white/5 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500 shadow-sm"
            >
              <option value="all">All Combined Branches</option>
              {AVAILABLE_BRANCHES.slice(1).map(b => (
                <option key={b} value={b} className="bg-[#0F172A] text-white">{b}</option>
              ))}
            </select>
          </div>

          {/* Quick Date Filters Selector */}
          <div>
            <label className="text-[9px] text-white/40 block font-bold mb-1 uppercase tracking-wider">Date range filter</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="bg-white/5 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500 shadow-sm uppercase tracking-wider"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>
        </div>
      </div>

      {/* CUSTOM DATE RANGE SELECTOR DRAWER */}
      {dateRange === 'custom' && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 bg-slate-900/40 rounded-xl border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="text-[9px] font-black uppercase text-white/45 block mb-1">Custom Start Date</label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="w-full bg-[#0F172A] text-white text-xs px-3 py-2 rounded-lg border border-white/10 font-bold focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-white/45 block mb-1">Custom End Date</label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="w-full bg-[#0F172A] text-white text-xs px-3 py-2 rounded-lg border border-white/10 font-bold focus:outline-none focus:border-cyan-500"
            />
          </div>
        </motion.div>
      )}

      {/* DYNAMIC METRIC GROUPS CONTROLLER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ROW 1 CARD 1: MAIN SALES SUMMARY */}
        <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <ShoppingBag className="text-cyan-400" size={18} />
            <h3 className="text-xs font-black uppercase text-white tracking-widest">Main Sales summary</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0F172A]/80 p-3 rounded-lg border border-white/5">
              <p className="text-[8px] uppercase font-bold text-white/40 tracking-wider">Direct sale amount</p>
              <p className="text-lg font-black text-emerald-400 font-mono mt-1">₹{reportStats.directSalesAmount.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-[#0F172A]/80 p-3 rounded-lg border border-white/5">
              <p className="text-[8px] uppercase font-bold text-white/40 tracking-wider">sales order amount</p>
              <p className="text-lg font-black text-cyan-400 font-mono mt-1">₹{reportStats.salesOrdersAmount.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-[#0F172A]/80 p-3 rounded-lg border border-white/5">
              <p className="text-[8px] uppercase font-bold text-white/40 tracking-wider">delivery collection</p>
              <p className="text-lg font-black text-purple-400 font-mono mt-1">₹{reportStats.deliveryCollectionAmount.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-950/40 to-cyan-950/40 p-3 rounded-lg border border-indigo-500/10">
              <p className="text-[8px] uppercase font-black text-cyan-200/50 tracking-wider">Total business</p>
              <p className="text-lg font-black text-white font-mono mt-1">₹{reportStats.totalBusinessAmount.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* ROW 1 CARD 2: PAYMENT COLLECTION SUMMARY */}
        <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Wallet className="text-emerald-400" size={18} />
            <h3 className="text-xs font-black uppercase text-white tracking-widest">Payment collection split</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0F172A]/80 p-3 rounded-lg border border-white/5">
              <p className="text-[8px] uppercase font-bold text-white/40 tracking-wider">💵 Cash collection</p>
              <p className="text-lg font-black text-emerald-400 font-mono mt-1">₹{reportStats.cashCollected.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-[#0F172A]/80 p-3 rounded-lg border border-white/5">
              <p className="text-[8px] uppercase font-bold text-white/40 tracking-wider">📱 UPI App collections</p>
              <p className="text-lg font-black text-cyan-400 font-mono mt-1">₹{reportStats.upiCollected.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-[#0F172A]/80 p-3 rounded-lg border border-white/5">
              <p className="text-[8px] uppercase font-bold text-white/40 tracking-wider">💳 Card collection</p>
              <p className="text-lg font-black text-indigo-400 font-mono mt-1">₹{reportStats.cardCollected.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-950/40 to-teal-950/40 p-3 rounded-lg border border-emerald-500/10">
              <p className="text-[8px] uppercase font-black text-emerald-250/50 tracking-wider">Total Register Collected</p>
              <p className="text-lg font-black text-white font-mono mt-1">₹{reportStats.totalCollection.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* ROW 1 CARD 3: PENDING SUMMARY */}
        <div className="p-6 bg-slate-900/40 rounded-2xl border border-white/5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Clock className="text-amber-400" size={18} />
            <h3 className="text-xs font-black uppercase text-white tracking-widest">Pending order &amp; pay balances</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0F172A]/80 p-3 rounded-lg border border-white/5">
              <p className="text-[8px] uppercase font-bold text-white/40 tracking-wider">⌛ Pending orders count</p>
              <p className="text-xl font-black text-amber-400 font-mono mt-1">{reportStats.pendingOrdersCount}</p>
            </div>
            <div className="bg-[#0F172A]/80 p-3 rounded-lg border border-white/5">
              <p className="text-[8px] uppercase font-bold text-white/40 tracking-wider">⌛ Pending order value</p>
              <p className="text-lg font-black text-amber-500 font-mono mt-1">₹{reportStats.pendingOrdersValue.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-[#0F172A]/80 p-3 rounded-lg border border-white/5">
              <p className="text-[8px] uppercase font-bold text-white/40 tracking-wider">💰 Pending Payments count</p>
              <p className="text-xl font-black text-orange-400 font-mono mt-1">{reportStats.pendingPaymentsCount}</p>
            </div>
            <div className="bg-[#0F172A]/80 p-3 rounded-lg border border-white/5">
              <p className="text-[8px] uppercase font-bold text-white/40 tracking-wider">💰 Pending payment value</p>
              <p className="text-lg font-black text-red-400 font-mono mt-1">₹{reportStats.pendingPaymentsValue.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

      </div>

      {/* QUICK FLOATING ACTIONS CONTROL ROW */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#0F172A] rounded-xl border border-white/5">
        <span className="text-xs font-black text-white/60 uppercase tracking-widest flex items-center gap-2">
          <span>⚡ Export report suite:</span>
        </span>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handlePrintPDFReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-white/15 text-xs font-black text-white uppercase tracking-wider hover:border-cyan-500 hover:text-cyan-400 transition-colors"
          >
            <Printer size={13} />
            <span>Print Report</span>
          </button>
          
          <button
            onClick={handlePrintPDFReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-white/15 text-xs font-black text-white uppercase tracking-wider hover:border-cyan-500 hover:text-cyan-400 transition-colors"
          >
            <Download size={13} />
            <span>Download PDF</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-white/15 text-xs font-black text-white uppercase tracking-wider hover:border-emerald-500 hover:text-emerald-400 transition-colors"
          >
            <Download size={13} />
            <span>Export Excel (CSV)</span>
          </button>

          <button
            onClick={() => setShowShareModal('whatsapp')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-950/50 border border-emerald-500/20 text-xs font-black text-emerald-400 uppercase tracking-wider hover:bg-emerald-900/50 transition-colors"
          >
            <MessageSquare size={13} />
            <span>whatsApp report</span>
          </button>

          <button
            onClick={handleSendEmail}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-indigo-950/50 border border-indigo-500/20 text-xs font-black text-indigo-400 uppercase tracking-wider hover:bg-indigo-900/50 transition-colors"
          >
            <Mail size={13} />
            <span>Email Report</span>
          </button>
        </div>
      </div>

      {/* THREE-SPLIT WORKSPACE LAYOUT PANELS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* WORKSPACE LEFT PART (2 COLUMNS): ADVANCED CORE TABLE SECTIONS & FILTERS */}
        <div className="xl:col-span-2 space-y-6">
          
          <div className="p-6 bg-[#0F172A] border border-white/5 rounded-2xl space-y-4">
            
            {/* Table search & quick type control checklists */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Sales ledger audit Table</h3>
                <p className="text-[10px] text-white/40 uppercase font-black">Filtered by search configurations</p>
              </div>

              {/* Collapsible status configuration sliders */}
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => setTypeFilters(prev => ({ ...prev, direct: !prev.direct }))}
                  className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider border transition-colors ${typeFilters.direct ? 'bg-emerald-900/40 text-emerald-400 border-emerald-500/40' : 'bg-transparent text-white/30 border-white/5'}`}
                >
                  Direct Sale
                </button>
                <button 
                  onClick={() => setTypeFilters(prev => ({ ...prev, orders: !prev.orders }))}
                  className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider border transition-colors ${typeFilters.orders ? 'bg-cyan-900/40 text-cyan-400 border-cyan-500/40' : 'bg-transparent text-white/30 border-white/5'}`}
                >
                  Sales Order
                </button>
                <button 
                  onClick={() => setTypeFilters(prev => ({ ...prev, collections: !prev.collections }))}
                  className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider border transition-colors ${typeFilters.collections ? 'bg-purple-900/40 text-purple-400 border-purple-500/40' : 'bg-transparent text-white/30 border-white/5'}`}
                >
                  Delivery Collection
                </button>
              </div>
            </div>

            {/* Additional state parameter controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/20 p-3 rounded-xl border border-white/5 text-[11px]">
              {/* PAID / PENDING CHECKBOX */}
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-white/40 font-bold uppercase tracking-widest text-[9px]">Invoice Filter:</span>
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={typeFilters.paid} 
                    onChange={() => setTypeFilters(prev => ({ ...prev, paid: !prev.paid }))}
                    className="rounded text-cyan-500 bg-slate-900 border-white/10"
                  />
                  <span>Paid Invoices</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={typeFilters.pending} 
                    onChange={() => setTypeFilters(prev => ({ ...prev, pending: !prev.pending }))}
                    className="rounded text-cyan-500 bg-slate-900 border-white/10"
                  />
                  <span>Pending Invoices</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-red-400">
                  <input 
                    type="checkbox" 
                    checked={typeFilters.cancelled} 
                    onChange={() => setTypeFilters(prev => ({ ...prev, cancelled: !prev.cancelled }))}
                    className="rounded text-cyan-500 bg-slate-900 border-white/10"
                  />
                  <span>Cancelled Orders</span>
                </label>
              </div>

              {/* PAYMENT TYPE CHECKBOX FILTER */}
              <div className="flex items-center gap-3 flex-wrap md:justify-end">
                <span className="text-white/40 font-bold uppercase tracking-widest text-[9px]">Payment Filter:</span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={paymentFilters.cash}
                    onChange={() => setPaymentFilters(prev => ({ ...prev, cash: !prev.cash }))}
                    className="rounded border-white/10"
                  />
                  <span>Cash</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={paymentFilters.upi}
                    onChange={() => setPaymentFilters(prev => ({ ...prev, upi: !prev.upi }))}
                    className="rounded border-white/10"
                  />
                  <span>UPI</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={paymentFilters.card}
                    onChange={() => setPaymentFilters(prev => ({ ...prev, card: !prev.card }))}
                    className="rounded border-white/10"
                  />
                  <span>Card</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={paymentFilters.mixed}
                    onChange={() => setPaymentFilters(prev => ({ ...prev, mixed: !prev.mixed }))}
                    className="rounded border-white/10"
                  />
                  <span>Mixed</span>
                </label>
              </div>
            </div>

            {/* MASTER AUDIT TABLE RENDER */}
            <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-950/40">
              <table className="w-full border-collapse text-left text-xs text-white">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-white/10 text-[9px] text-white/40 uppercase tracking-wider font-extrabold">
                    <th className="px-4 py-3">Invoice No</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Customer Name</th>
                    <th className="px-4 py-3">Mobile No</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3 text-right">Direct Sale</th>
                    <th className="px-4 py-3 text-right">Sales Order</th>
                    <th className="px-4 py-3 text-right">Deliv Collection</th>
                    <th className="px-4 py-3 text-right bg-white/[0.02]">Bill Amount</th>
                    <th className="px-4 py-3 text-right">Cash</th>
                    <th className="px-4 py-3 text-right">UPI</th>
                    <th className="px-4 py-3 text-right">Card</th>
                    <th className="px-4 py-3 text-right">Balance</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px]">
                  {processedTableInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="px-4 py-12 text-center text-white/30 italic">
                        No transactions match those filters. Expand filter checkboxes to explore.
                      </td>
                    </tr>
                  ) : (
                    processedTableInvoices.map((inv) => {
                      const cust = customers.find(c => c.id === inv.customerId);
                      const isDirect = inv.type === 'Direct Sale';
                      const isOrder = inv.type === 'Sales Order' && inv.status !== 'Delivered';
                      const isCollection = inv.type === 'Sales Order' && inv.status === 'Delivered';

                      return (
                        <tr key={inv.id} className="hover:bg-white/[0.01] transition-colors leading-tight">
                          <td className="px-4 py-2.5 font-bold font-mono text-cyan-400">{inv.invoiceNumber}</td>
                          <td className="px-4 py-2.5 font-mono text-slate-400">{new Date(inv.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-2.5 font-semibold text-white">{cust ? cust.name : 'Walk-in Guest'}</td>
                          <td className="px-4 py-2.5 font-mono text-slate-400">{cust ? cust.mobile : '—'}</td>
                          <td className="px-4 py-2.5 uppercase text-[9px] font-black">
                            <span className={inv.type === 'Direct Sale' ? 'text-emerald-400' : 'text-cyan-400'}>{inv.type}</span>
                          </td>
                          <td className="px-4 py-2.5 text-right text-emerald-400 font-mono">
                            ₹{isDirect ? inv.grandTotal.toLocaleString('en-IN') : '0'}
                          </td>
                          <td className="px-4 py-2.5 text-right text-cyan-400 font-mono">
                            ₹{isOrder ? inv.grandTotal.toLocaleString('en-IN') : '0'}
                          </td>
                          <td className="px-4 py-2.5 text-right text-purple-400 font-mono">
                            ₹{isCollection ? (inv.finalCollectionPaymentDetail?.total || inv.balanceAmount).toLocaleString('en-IN') : '0'}
                          </td>
                          <td className="px-4 py-2.5 text-right font-black font-mono bg-white/[0.01] text-indigo-200">
                            ₹{inv.grandTotal.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-2.5 text-right text-slate-300 font-mono">
                            ₹{(inv.paymentDetail.cash + (inv.finalCollectionPaymentDetail?.cash || 0)).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-2.5 text-right text-slate-300 font-mono">
                            ₹{(inv.paymentDetail.upi + (inv.finalCollectionPaymentDetail?.upi || 0)).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-2.5 text-right text-slate-300 font-mono">
                            ₹{(inv.paymentDetail.card + (inv.finalCollectionPaymentDetail?.card || 0)).toLocaleString('en-IN')}
                          </td>
                          <td className={`px-4 py-2.5 text-right font-bold font-mono ${inv.balanceAmount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                            ₹{inv.balanceAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider select-none ${
                              inv.status === 'Delivered' 
                                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50' 
                                : inv.status === 'Cancelled' 
                                  ? 'bg-red-950/40 text-red-500 border border-red-900/50' 
                                  : 'bg-amber-950/40 text-amber-500 border border-amber-900/50'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>

          {/* DYNAMIC ADDITIONAL DETAILED REPORTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. PENDING ORDERS REPORT SUMMARY PANEL */}
            <div className="p-6 bg-[#0F172A] border border-white/5 rounded-2xl space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">📋</span>
                  <h4 className="text-xs font-black uppercase text-white tracking-widest">Pending Orders report</h4>
                </div>
                <span className="text-[10px] font-mono bg-amber-950/40 border border-amber-900/50 text-amber-400 px-2 py-0.5 rounded font-black">
                  {pendingOrdersReportList.length} ORDERS
                </span>
              </div>

              <div className="overflow-y-auto max-h-[250px] space-y-3 pr-1">
                {pendingOrdersReportList.length === 0 ? (
                  <p className="text-center text-xs py-10 text-white/30 italic">No pending client store orders found!</p>
                ) : (
                  pendingOrdersReportList.map(item => {
                    const cust = customers.find(c => c.id === item.customerId);
                    return (
                      <div key={item.id} className="p-3 bg-black/25 rounded-xl border border-white/5 text-xs flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-white mb-1">
                            <span className="font-mono text-cyan-400">{item.invoiceNumber}</span>
                            <span>•</span>
                            <span>{cust ? cust.name : 'Client'}</span>
                          </div>
                          <div className="text-[10px] text-white/40 font-semibold space-y-0.5">
                            <p>Order: {new Date(item.createdAt).toLocaleDateString()}</p>
                            <p>Expected Delivery: <strong className="text-cyan-400">{new Date(item.createdAt + 7*24*3600*1000).toLocaleDateString()}</strong></p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-white">₹{item.grandTotal.toLocaleString('en-IN')}</p>
                          <p className="text-[9px] text-emerald-400 font-bold mt-0.5">Paid: ₹{item.advanceAmount}</p>
                          <p className="text-[9px] text-red-400 font-bold">Due: ₹{item.balanceAmount}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* 2. PENDING COMPLETED INVOICE PAYMENT RECORDS */}
            <div className="p-6 bg-[#0F172A] border border-white/5 rounded-2xl space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">💵</span>
                  <h4 className="text-xs font-black uppercase text-white tracking-widest">Pending Payments report</h4>
                </div>
                <span className="text-[10px] font-mono bg-red-950/40 border border-red-900/50 text-red-500 px-2 py-0.5 rounded font-black">
                  {pendingPaymentReportList.length} BILLS
                </span>
              </div>

              <div className="overflow-y-auto max-h-[250px] space-y-3 pr-1">
                {pendingPaymentReportList.length === 0 ? (
                  <p className="text-center text-xs py-10 text-white/30 italic">No unpaid balance invoices found!</p>
                ) : (
                  pendingPaymentReportList.map(inv => {
                    const cust = customers.find(c => c.id === inv.customerId);
                    const daysPending = Math.floor((referenceTime - inv.createdAt) / (24 * 3600 * 1000));
                    return (
                      <div key={inv.id} className="p-3 bg-black/25 rounded-xl border border-white/5 text-xs flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2 font-black text-white mb-0.5">
                            <span className="font-mono text-cyan-400">{inv.invoiceNumber}</span>
                            <span>•</span>
                            <span>{cust ? cust.name : 'Unknown Contact'}</span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-400">Mobile: {cust ? cust.mobile : 'N/A'}</p>
                          <p className="text-[9px] inline-block bg-red-950/30 text-rose-450 border border-red-900/40 px-1 py-0.2 rounded font-extrabold mt-1.5 uppercase">
                            ⌛ {daysPending} days pending
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-extrabold text-white">₹{inv.grandTotal.toLocaleString('en-IN')}</p>
                          <p className="text-[10px] text-white/40">Paid: ₹{inv.advanceAmount}</p>
                          <p className="text-xs font-black text-rose-400 font-mono">Due: ₹{inv.balanceAmount.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* MONTHLY CONSOLIDATED CHART GRAPHIC REPRESENTATION */}
          <div className="p-6 bg-[#0F172A] border border-white/5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="text-purple-400" size={18} />
                <h4 className="text-xs font-black uppercase text-white tracking-widest">Monthly Business summary chart scale</h4>
              </div>
            </div>

            {monthlyBusinessSummary.length === 0 ? (
              <p className="text-center py-8 text-white/30 text-xs italic">No monthly aggregates calculated yet.</p>
            ) : (
              <div className="space-y-4">
                {monthlyBusinessSummary.map(mo => (
                  <div key={mo.month} className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-black text-white text-xs uppercase tracking-wider">{mo.month}</h5>
                        <p className="text-[10px] font-bold text-white/40">Consolidated Branch performance values</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">Total Business Value</span>
                        <p className="text-base font-black text-emerald-400 font-mono">₹{mo.revenue.toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 whitespace-nowrap text-[10px] font-semibold text-white/60">
                      <div>📁 Direct: <strong className="text-white">₹{mo.directSalesAmount}</strong></div>
                      <div>📋 Order: <strong className="text-white">₹{mo.salesOrdersAmount}</strong></div>
                      <div>💵 Cash: <strong className="text-white font-mono">₹{mo.cashCollected}</strong></div>
                      <div>📱 UPI: <strong className="text-white font-mono">₹{mo.upiCollected}</strong></div>
                    </div>

                    {/* Progress Bar Visualizer */}
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-1.5 rounded-full" 
                        style={{ width: `${Math.min(100, (mo.revenue / 75000) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* WORKSPACE RIGHT PART (1 COLUMN): CUSTOMER PERFORMANCE SEARCH DRAWER */}
        <div className="space-y-6">
          
          <div className="p-6 bg-[#0F172A] border border-white/5 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <User className="text-cyan-400" size={18} />
              <h3 className="text-xs font-black uppercase text-white tracking-widest">Customer Sales Performance</h3>
            </div>

            <p className="text-[10px] text-white/50 leading-relaxed uppercase font-bold">
              Instantly search by Client Name, Mobile Number, or Customer ID to run history audit metrics:
            </p>

            {/* Look up input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-white/30" size={14} />
              <input
                type="text"
                placeholder="Search Client Name, mobile, ID..."
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                className="w-full bg-slate-950 text-xs text-white px-9 py-2.5 rounded-xl border border-white/10 font-sans font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Results selection drawer */}
            {customerSearchResults.length > 0 && (
              <div className="py-1 bg-slate-950 border border-white/10 rounded-xl divide-y divide-white/5 max-h-[160px] overflow-y-auto">
                {customerSearchResults.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedReportCustomer(c);
                      setCustomerSearchQuery('');
                    }}
                    className="w-full text-left p-2.5 font-sans font-medium text-xs hover:bg-white/[0.03] text-white flex flex-col gap-0.5"
                  >
                    <div className="font-bold flex items-center justify-between text-white">
                      <span>{c.name}</span>
                      <span className="text-[9px] font-mono bg-white/5 px-1.5 py-0.2 rounded text-cyan-400 font-black">{c.id}</span>
                    </div>
                    <div className="text-[10px] text-white/40">Mobile: {c.mobile}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Active Selected Customer Profile Metrics Shelf */}
            <AnimatePresence mode="popLayout">
              {selectedReportCustomer && customerSummaryData ? (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 pt-2"
                >
                  <div className="p-3 bg-black/25 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-white text-xs uppercase">{selectedReportCustomer.name}</h4>
                      <p className="text-[9px] font-bold text-cyan-400 mt-0.5">Mobile: {selectedReportCustomer.mobile}</p>
                    </div>
                    <button
                      onClick={() => setSelectedReportCustomer(null)}
                      className="text-[9px] font-black text-white/40 hover:text-white uppercase"
                    >
                      CLEAR
                    </button>
                  </div>

                  {/* Customer stat details */}
                  <div className="grid grid-cols-2 gap-3 text-xs leading-tight">
                    <div className="p-2.5 bg-[#020617]/50 rounded-lg border border-white/5">
                      <span className="text-[8px] text-white/40 uppercase font-black tracking-wider block">Total Purchases</span>
                      <strong className="text-white text-sm">{customerSummaryData.totalPurchases} Units</strong>
                    </div>
                    <div className="p-2.5 bg-[#020617]/50 rounded-lg border border-white/5">
                      <span className="text-[8px] text-white/40 uppercase font-black tracking-wider block">Total Orders</span>
                      <strong className="text-white text-sm">{customerSummaryData.totalOrders} Placed</strong>
                    </div>
                    <div className="p-2.5 bg-[#020617]/50 rounded-lg border border-white/5">
                      <span className="text-[8px] text-white/40 uppercase font-black tracking-wider block">Total Sales Value</span>
                      <strong className="text-emerald-400 text-sm font-mono">₹{customerSummaryData.totalSalesValue.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="p-2.5 bg-[#020617]/50 rounded-lg border border-white/5">
                      <span className="text-[8px] text-white/40 uppercase font-black tracking-wider block">Total Paid Amt</span>
                      <strong className="text-cyan-400 text-sm font-mono">₹{customerSummaryData.totalPaidAmount.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="p-2.5 bg-red-950/20 rounded-lg border border-red-900/30">
                      <span className="text-[8px] text-red-400/60 uppercase font-black tracking-wider block">Pending balance</span>
                      <strong className="text-red-400 text-sm font-mono">₹{customerSummaryData.pendingAmount.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="p-2.5 bg-[#020617]/50 rounded-lg border border-white/5">
                      <span className="text-[8px] text-white/40 uppercase font-black tracking-wider block">Last Purchase Date</span>
                      <span className="text-white font-mono text-[11px] block mt-0.5">{customerSummaryData.lastPurchaseDate}</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#020617]/50 rounded-lg border border-white/5 text-[10px]">
                    <span className="text-[8px] text-white/40 uppercase font-black tracking-wider block mb-1">Last Invoice Number</span>
                    <strong className="text-white font-mono">{customerSummaryData.lastInvoiceNumber}</strong>
                  </div>

                  {/* CUSTOMER PURCHASE HISTORY */}
                  <div className="space-y-2">
                    <h5 className="text-[9px] font-black uppercase text-white/40 tracking-wider">Purchase History Ledger</h5>
                    <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                      {customerSummaryData.history.length === 0 ? (
                        <p className="text-center text-[10px] text-white/30 italic">No purchase rows recorded.</p>
                      ) : (
                        customerSummaryData.history.map(inv => {
                          const framesStr = getPurchasedItemsString(inv.items, 'frame');
                          const lensStr = getPurchasedItemsString(inv.items, 'lens');
                          const sunglassStr = getPurchasedItemsString(inv.items, 'sunglass');

                          return (
                            <div key={inv.id} className="p-2 bg-black/25 rounded-md border border-white/[0.04] text-[10px] space-y-1">
                              <div className="flex justify-between items-center text-[9px] border-b border-white/[0.03] pb-1">
                                <span className="font-mono text-cyan-400 font-bold">{inv.invoiceNumber}</span>
                                <span className="text-white/40">{new Date(inv.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="grid grid-cols-3 gap-1 text-[9px] text-white/50">
                                <div>Frame: <strong className="text-white/95 truncate block">{framesStr}</strong></div>
                                <div>Lens: <strong className="text-white/95 truncate block">{lensStr}</strong></div>
                                <div>SunGL: <strong className="text-white/95 truncate block">{sunglassStr}</strong></div>
                              </div>
                              <div className="flex justify-between items-center text-[9px] pt-1">
                                <span className="text-emerald-400 font-mono font-bold">₹{inv.grandTotal}</span>
                                <span className={inv.status === 'Delivered' ? 'text-emerald-400' : 'text-amber-500'}>
                                  {inv.status === 'Delivered' ? 'Paid Complete' : 'Balance Unpaid'}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="py-12 border border-dashed border-white/5 rounded-xl text-center text-white/30 text-xs italic">
                  Search and Select a client above to retrieve their aggregate store summaries!
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* WHATSAPP DOCK PREVIEW CARD SHORTCUT */}
          <div className="p-5 bg-gradient-to-br from-emerald-950/20 to-teal-950/20 border border-emerald-900/30 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 border-b border-white/5 pb-2">
              <MessageSquare size={16} />
              <h4 className="text-[10px] font-black uppercase tracking-wider">Live WhatsApp Copy Deck</h4>
            </div>

            <pre className="p-2.5 bg-black/40 rounded text-[9px] font-mono text-slate-350 leading-relaxed overflow-x-auto">
              {whatsAppReportText}
            </pre>

            <button
              onClick={() => {
                navigator.clipboard.writeText(whatsAppReportText);
                setShowNotification('Copied report template directly to your clipboard!');
                setTimeout(() => setShowNotification(null), 3000);
              }}
              className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded transition-colors"
            >
              Copy Whatsapp String
            </button>
          </div>

        </div>

      </div>

      {/* MODALS / OVERLAYS / SCREEN SHORTCUTS */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 p-4 bg-slate-900 border-2 border-cyan-500 text-white text-xs font-bold rounded-xl shadow-2xl z-50 flex items-center gap-2"
          >
            <CheckCircle className="text-cyan-400" size={16} />
            <span>{showNotification}</span>
          </motion.div>
        )}

        {/* WHATSAPP DIALOG CHANCE */}
        {showShareModal === 'whatsapp' && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-[#0F172A] border border-white/10 p-6 rounded-2xl shadow-2xl space-y-4 text-white"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <MessageSquare size={14} />
                  <span>Send WhatsApp Daily Report</span>
                </span>
                <button onClick={() => setShowShareModal(null)} className="text-white/40 hover:text-white font-bold">&times;</button>
              </div>

              <div className="space-y-1 text-xs text-white/50">
                <p>The report can be copied or launched instantly on real WhatsApp Web:</p>
              </div>

              <textarea
                readOnly
                value={whatsAppReportText}
                className="w-full h-80 bg-black/35 border border-white/10 rounded-xl p-3 font-mono text-[10px] text-slate-300 focus:outline-none"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(whatsAppReportText);
                    setShowNotification('Copied WhatsApp daily sales status string!');
                    setShowShareModal(null);
                    setTimeout(() => setShowNotification(null), 3500);
                  }}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black rounded uppercase"
                >
                  Copy String
                </button>
                <button
                  onClick={() => {
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(whatsAppReportText)}`, '_blank');
                    setShowShareModal(null);
                  }}
                  className="flex-1 py-2 bg-slate-900 border border-white/15 text-xs font-black text-cyan-400 rounded uppercase hover:border-cyan-500"
                >
                  Launch App Link
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
