'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { useAuth } from '@/lib/AuthContext';
import { branchService } from '@/lib/services/branchService';
import { Invoice, Customer, StockItem } from '@/lib/types';
import { 
  ArrowLeft, Calendar, FileText, Search, Filter, RefreshCw, Printer,
  Download, Send, MessageSquare, Mail, BarChart3,
  ShoppingBag, DollarSign, Wallet, Clock, User, Phone, CheckCircle, AlertCircle, Users, Package, Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  onBack: () => void;
}

export function CompanyReportsView({ onBack }: Props) {
  const { session, switchBranch } = useAuth();
  const store = useStore();
  
  // Data
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [branchError, setBranchError] = useState(false);

  // Filter criteria states
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | 'week' | 'month' | 'last_month' | 'custom'>('month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(session?.branchID || 'ALL');

  useEffect(() => {
    setSelectedBranchId(session?.branchID || 'ALL');
    console.log("[COMPANY REPORTS] Selected BranchID:", session?.branchID || 'ALL');
  }, [session?.branchID]);

  // Load Data
  const loadData = () => {
    setInvoices(store.getInvoices());
    setCustomers(store.getCustomers());
    setStockItems(store.getStockInventory());
  };

  useEffect(() => {
    loadData();
    // Load branches
    if (session?.companyID) {
      setLoadingBranches(true);
      branchService.getBranchesV2().then(all => {
         console.log("[COMPANY REPORTS] Authenticated CompanyID:", session.companyID);
         console.log("[COMPANY REPORTS] Branch API Response:", all);
         console.log("[COMPANY REPORTS] Total Branches:", all.length);
         const companyBranches = all.filter((b: any) => 
           String(b.CompanyID || b.companyId || '').trim() === String(session?.companyID || '').trim() &&
           String(b.Status || b.status || 'Active').trim().toUpperCase() === 'ACTIVE'
         );
         
         // Remove duplicates by BranchID
         const uniqueBranches = Array.from(new Map(companyBranches.map(b => [b.BranchID || b.id, b])).values());
         
         // Sort alphabetically by BranchName
         uniqueBranches.sort((a: any, b: any) => {
           const nameA = a.BranchName || a.branchName || '';
           const nameB = b.BranchName || b.branchName || '';
           return nameA.localeCompare(nameB);
         });
         
         setBranches(uniqueBranches);
         console.log("[COMPANY REPORTS] Company Branches:", uniqueBranches.length);
      }).catch(e => {
         console.error("[COMPANY REPORTS] Error loading branches:", e);
         setBranchError(true);
      }).finally(() => setLoadingBranches(false));
    }
  }, []); // We don't re-run this on session changes, it's just mounting. store will update via listeners.

  // We should also listen to store updates if we want reactive data
  // But store.getInvoices() triggers a react render anyway via useStore() hook in the parent or here?
  // useStore() calls setTick which causes a re-render. So we can just call loadData in the render?
  // Actually, yes, using the getters directly in the body is reactive.
  const reactiveInvoices = store.getInvoices();
  const reactiveCustomersRaw = store.getCustomers();
  const reactiveCustomers = useMemo(() => {
    return reactiveCustomersRaw.filter(c => {
      const custCompanyId = (c as any).companyId || (c as any).CompanyID || '';
      if (session?.role !== 'SUPER_ADMIN' && custCompanyId && custCompanyId !== session?.companyID) return false;
      if (selectedBranchId !== 'ALL') {
         const custBranchId = (c as any).branchId || (c as any).BranchID || '';
         if (custBranchId && custBranchId !== selectedBranchId) return false;
      }
      return true;
    });
  }, [reactiveCustomersRaw, session?.companyID, session?.role, selectedBranchId]);
  const reactiveStockRaw = store.getStockInventory();
  const reactiveStock = useMemo(() => {
    return reactiveStockRaw.filter(s => {
      const stockCompanyId = (s as any).companyId || (s as any).CompanyID || '';
      if (session?.role !== 'SUPER_ADMIN' && stockCompanyId && stockCompanyId !== session?.companyID) return false;
      if (selectedBranchId !== 'ALL') {
         const stockBranchId = (s as any).branch || (s as any).branchId || (s as any).BranchID || '';
         if (stockBranchId && stockBranchId !== selectedBranchId) return false;
      }
      return true;
    });
  }, [reactiveStockRaw, session?.companyID, session?.role, selectedBranchId]);

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBranchId = e.target.value;
    const b = branches.find(br => (br.BranchID === newBranchId || br.id === newBranchId));
    const newName = b ? (b.BranchName || b.branchName || newBranchId) : 'All Branches';
    switchBranch(newBranchId, newName);
  };

  // Compute date boundaries
  const dateBoundaries = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const yesterdayStart = new Date(todayStart.getTime() - 24 * 3600 * 1000);
    const yesterdayEnd = new Date(todayEnd.getTime() - 24 * 3600 * 1000);

    const thisWeekStart = new Date(todayStart);
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());

    const thisMonthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
    
    const lastMonthStart = new Date(todayStart.getFullYear(), todayStart.getMonth() - 1, 1);
    const lastMonthEnd = new Date(todayStart.getFullYear(), todayStart.getMonth(), 0);
    lastMonthEnd.setHours(23, 59, 59, 999);

    return { todayStart, todayEnd, yesterdayStart, yesterdayEnd, thisWeekStart, thisMonthStart, lastMonthStart, lastMonthEnd };
  }, []);

  // Filter Invoices
  const filteredInvoices = useMemo(() => {
    return reactiveInvoices.filter(inv => {
      // Company filter - Ensure invoice belongs to this company
      const invCompanyId = (inv as any).companyId || (inv as any).CompanyID || '';
      if (session?.role !== 'SUPER_ADMIN' && invCompanyId && invCompanyId !== session?.companyID) {
        return false;
      }

      // Branch filter
      if (selectedBranchId !== 'ALL') {
        const invBranchId = (inv as any).branchId || (inv as any).BranchID || '';
        if (invBranchId !== selectedBranchId) {
          return false;
        }
      }
      
      // Date Filter
      const d = new Date(inv.createdAt || inv.updatedAt || Date.now());
      let dateMatch = true;
      switch (dateRange) {
        case 'today':
          dateMatch = d >= dateBoundaries.todayStart && d <= dateBoundaries.todayEnd;
          break;
        case 'yesterday':
          dateMatch = d >= dateBoundaries.yesterdayStart && d <= dateBoundaries.yesterdayEnd;
          break;
        case 'week':
          dateMatch = d >= dateBoundaries.thisWeekStart && d <= dateBoundaries.todayEnd;
          break;
        case 'month':
          dateMatch = d >= dateBoundaries.thisMonthStart && d <= dateBoundaries.todayEnd;
          break;
        case 'last_month':
          dateMatch = d >= dateBoundaries.lastMonthStart && d <= dateBoundaries.lastMonthEnd;
          break;
        case 'custom':
          if (customStartDate) {
            const start = new Date(customStartDate);
            start.setHours(0, 0, 0, 0);
            if (d < start) dateMatch = false;
          }
          if (customEndDate) {
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
            if (d > end) dateMatch = false;
          }
          break;
      }
      return dateMatch;
    });
  }, [reactiveInvoices, dateRange, customStartDate, customEndDate, dateBoundaries, selectedBranchId, session?.companyID, session?.role]);

  // Calculations
  const calc = useMemo(() => {
    let totalSales = 0;
    let directSales = 0;
    let salesOrders = 0;
    let deliveryCollections = 0;
    let totalInvoiceValue = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let totalAdvance = 0;
    let totalOutstanding = 0;

    let cash = 0;
    let card = 0;
    let upi = 0;
    let mixed = 0;
    let totalCollection = 0;

    let ordersTotal = 0;
    let ordersPending = 0;
    let ordersInLab = 0;
    let ordersReady = 0;
    let ordersDelivered = 0;
    let ordersCancelled = 0;

    filteredInvoices.forEach(inv => {
      if (inv.type === 'Direct Sale') {
        directSales++;
        totalSales += inv.grandTotal;
      } else if (inv.type === 'Sales Order') {
        salesOrders++;
        totalSales += inv.grandTotal; // Assuming total sales counts order value
      } else if (inv.type === 'Delivery Collection') {
        deliveryCollections++;
      }

      totalInvoiceValue += inv.grandTotal;
      totalDiscount += (inv.totalDiscount || 0);
      totalAdvance += (inv.advanceAmount || 0);
      totalOutstanding += (inv.balanceAmount || 0);

      // Payments
      const pd = inv.paymentDetail || {};
      const payTotal = (pd.cash || 0) + (pd.card || 0) + (pd.upi || 0);
      totalCollection += payTotal;
      
      let methods = 0;
      if (pd.cash) methods++;
      if (pd.card) methods++;
      if (pd.upi) methods++;

      if (methods > 1) {
        mixed += payTotal;
      } else {
        if (pd.cash) cash += pd.cash;
        if (pd.card) card += pd.card;
        if (pd.upi) upi += pd.upi;
      }

      // Orders logic
      if (inv.type === 'Sales Order') {
        ordersTotal++;
        if (inv.status === 'Ordered') ordersPending++;
        else if (inv.status === 'In Lab') ordersInLab++;
        else if (inv.status === 'Ready') ordersReady++;
        else if (inv.status === 'Delivered') ordersDelivered++;
        else if (inv.status === 'Cancelled') ordersCancelled++;
      }
    });

    return {
      totalSales, directSales, salesOrders, deliveryCollections, totalInvoiceValue,
      totalDiscount, totalTax, totalAdvance, totalOutstanding,
      cash, card, upi, mixed, totalCollection,
      ordersTotal, ordersPending, ordersInLab, ordersReady, ordersDelivered, ordersCancelled
    };
  }, [filteredInvoices]);

  // Inventory
  const invCalc = useMemo(() => {
    let totalItems = reactiveStock.length;
    let lowStock = 0;
    let outOfStock = 0;
    let totalValue = 0;

    reactiveStock.forEach(item => {
      if (item.quantity <= 0) outOfStock++;
      else if (item.quantity <= 5) lowStock++;
      totalValue += (item.quantity * item.purchasePrice);
    });

    return { totalItems, lowStock, outOfStock, totalValue };
  }, [reactiveStock]);

  // Format currency
  const formatMoney = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between p-5 bg-[#0F172A] rounded-2xl border border-white/5 shadow-xl">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2.5 hover:bg-white/5 rounded-full transition-colors border border-white/10" title="Back">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="text-pink-400">📊</span> Company Reports
            </h1>
            <p className="text-xs text-white/50 tracking-wider">CONSOLIDATED MULTI-BRANCH ANALYTICS</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Branch Selector */}
          <div>
            <label className="text-[9px] text-white/40 block font-bold mb-1 uppercase tracking-wider">Target Branch</label>
            <select
              value={selectedBranchId}
              onChange={handleBranchChange}
              disabled={loadingBranches || branchError || branches.length === 0}
              className="bg-white/5 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-pink-500 shadow-sm"
            >
              {loadingBranches ? (
                <option value="ALL">Loading branches...</option>
              ) : branchError ? (
                <option value="ALL">Unable to load branches</option>
              ) : branches.length === 0 ? (
                <option value="ALL">No active branches found</option>
              ) : (
                <>
                  <option value="ALL">All Branches</option>
                  {branches.map(b => (
                    <option key={b.BranchID || b.id} value={b.BranchID || b.id}>{b.BranchName || b.branchName || b.BranchID || b.id}</option>
                  ))}
                </>
              )}
            </select>
            {branchError && (
              <div className="text-[9px] text-rose-400 mt-1 uppercase tracking-wider max-w-[200px]">
                Unable to load company branches. Please check the branch connection and try again.
              </div>
            )}
          </div>

          {/* Date Filter */}
          <div>
            <label className="text-[9px] text-white/40 block font-bold mb-1 uppercase tracking-wider">Date range filter</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="bg-white/5 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none focus:border-pink-500 shadow-sm uppercase tracking-wider"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {dateRange === 'custom' && (
            <div className="flex gap-2">
              <div>
                <label className="text-[9px] text-white/40 block font-bold mb-1 uppercase tracking-wider">Start</label>
                <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className="bg-white/5 text-white text-xs font-bold px-2 py-1.5 rounded-lg border border-white/10" />
              </div>
              <div>
                <label className="text-[9px] text-white/40 block font-bold mb-1 uppercase tracking-wider">End</label>
                <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className="bg-white/5 text-white text-xs font-bold px-2 py-1.5 rounded-lg border border-white/10" />
              </div>
            </div>
          )}

          <div className="flex gap-2 self-end">
             <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-500/20 text-pink-400 text-xs font-bold border border-pink-500/30 hover:bg-pink-500 hover:text-white transition-colors" onClick={() => window.print()}>
               <Printer size={14} /> Print
             </button>
             <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-colors">
               <Download size={14} /> Export CSV
             </button>
          </div>
        </div>
      </div>

      {/* DASHBOARD CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* SALES */}
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-white/60 text-xs font-black uppercase tracking-widest flex items-center gap-2"><DollarSign size={14}/> Sales & Revenue</h3>
          </div>
          <div className="text-3xl font-black text-white mb-4">{formatMoney(calc.totalInvoiceValue)}</div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-white/70"><span>Total Sales:</span> <span className="font-bold text-white">{calc.totalSales}</span></div>
            <div className="flex justify-between text-white/70"><span>Direct Sales:</span> <span className="font-bold text-emerald-400">{calc.directSales}</span></div>
            <div className="flex justify-between text-white/70"><span>Sales Orders:</span> <span className="font-bold text-blue-400">{calc.salesOrders}</span></div>
            <div className="flex justify-between text-white/70"><span>Total Discount:</span> <span className="font-bold text-rose-400">{formatMoney(calc.totalDiscount)}</span></div>
            <div className="flex justify-between text-white/70"><span>Outstanding:</span> <span className="font-bold text-orange-400">{formatMoney(calc.totalOutstanding)}</span></div>
          </div>
        </div>

        {/* PAYMENT */}
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-white/60 text-xs font-black uppercase tracking-widest flex items-center gap-2"><Wallet size={14}/> Collections</h3>
          </div>
          <div className="text-3xl font-black text-emerald-400 mb-4">{formatMoney(calc.totalCollection)}</div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-white/70"><span>Cash:</span> <span className="font-bold text-white">{formatMoney(calc.cash)}</span></div>
            <div className="flex justify-between text-white/70"><span>Card:</span> <span className="font-bold text-white">{formatMoney(calc.card)}</span></div>
            <div className="flex justify-between text-white/70"><span>UPI:</span> <span className="font-bold text-white">{formatMoney(calc.upi)}</span></div>
            <div className="flex justify-between text-white/70"><span>Mixed/Other:</span> <span className="font-bold text-white">{formatMoney(calc.mixed)}</span></div>
          </div>
        </div>

        {/* ORDERS */}
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 rounded-2xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-white/60 text-xs font-black uppercase tracking-widest flex items-center gap-2"><ShoppingBag size={14}/> Orders Status</h3>
          </div>
          <div className="text-3xl font-black text-blue-400 mb-4">{calc.ordersTotal}</div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-white/70"><span>Pending:</span> <span className="font-bold text-orange-400">{calc.ordersPending}</span></div>
            <div className="flex justify-between text-white/70"><span>In Lab:</span> <span className="font-bold text-purple-400">{calc.ordersInLab}</span></div>
            <div className="flex justify-between text-white/70"><span>Ready:</span> <span className="font-bold text-cyan-400">{calc.ordersReady}</span></div>
            <div className="flex justify-between text-white/70"><span>Delivered:</span> <span className="font-bold text-emerald-400">{calc.ordersDelivered}</span></div>
          </div>
        </div>

        {/* INVENTORY & CUSTOMERS */}
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-white/10 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-white/60 text-xs font-black uppercase tracking-widest flex items-center gap-2"><Package size={14}/> Inventory</h3>
            </div>
            <div className="space-y-2 text-xs mb-4">
              <div className="flex justify-between text-white/70"><span>Total Value:</span> <span className="font-bold text-white">{formatMoney(invCalc.totalValue)}</span></div>
              <div className="flex justify-between text-white/70"><span>Low Stock:</span> <span className="font-bold text-orange-400">{invCalc.lowStock}</span></div>
              <div className="flex justify-between text-white/70"><span>Out of Stock:</span> <span className="font-bold text-rose-400">{invCalc.outOfStock}</span></div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-4 mt-2">
            <div className="flex justify-between items-center mb-2">
               <h3 className="text-white/60 text-xs font-black uppercase tracking-widest flex items-center gap-2"><Users size={14}/> Customers</h3>
            </div>
            <div className="flex justify-between text-white/70 text-xs"><span>Total Customers:</span> <span className="font-bold text-white">{reactiveCustomers.length}</span></div>
          </div>
        </div>
      </div>

      
      {/* BRANCH COMPARISON */}
      {selectedBranchId === 'ALL' && (
        <div className="bg-[#0F172A] rounded-2xl border border-white/5 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1E293B]/50">
            <h2 className="text-sm font-bold text-white flex items-center gap-2"><Building size={16} className="text-cyan-400"/> Branch Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-[10px] uppercase tracking-wider text-white/50 border-b border-white/10">
                  <th className="p-4 font-black">Branch</th>
                  <th className="p-4 font-black text-right">Total Sales</th>
                  <th className="p-4 font-black text-right">Collections</th>
                  <th className="p-4 font-black text-right">Orders</th>
                  <th className="p-4 font-black text-right">Customers</th>
                </tr>
              </thead>
              <tbody className="text-xs text-white/80 divide-y divide-white/5">
                {branches.map(b => {
                  const bInv = filteredInvoices.filter(i => (i as any).branchId === b.BranchID || (i as any).branchId === b.id || (i as any).branchId === b.BranchName);
                  let bSales = 0;
                  let bColl = 0;
                  let bOrd = 0;
                  bInv.forEach(i => {
                    bSales += i.grandTotal;
                    const pd = i.paymentDetail || {};
                    bColl += (pd.cash || 0) + (pd.card || 0) + (pd.upi || 0);
                    if (i.type === 'Sales Order') bOrd++;
                  });
                  const bCust = reactiveCustomers.filter(c => (c as any).branchId === b.BranchID || (c as any).branchId === b.id).length;
                  return (
                    <tr key={b.BranchID || b.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => switchBranch(b.BranchID || b.id, b.BranchName || b.branchName)}>
                      <td className="p-4 font-bold text-cyan-400">{b.BranchName || b.branchName}</td>
                      <td className="p-4 text-right">{formatMoney(bSales)}</td>
                      <td className="p-4 text-right">{formatMoney(bColl)}</td>
                      <td className="p-4 text-right">{bOrd}</td>
                      <td className="p-4 text-right">{bCust}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TOP PRODUCTS */}
      <div className="bg-[#0F172A] rounded-2xl border border-white/5 shadow-xl overflow-hidden">
         <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1E293B]/50">
           <h2 className="text-sm font-bold text-white flex items-center gap-2"><Package size={16} className="text-purple-400"/> Top Products Sold</h2>
         </div>
         <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-white/5 text-[10px] uppercase tracking-wider text-white/50 border-b border-white/10">
                 <th className="p-4 font-black">Product</th>
                 <th className="p-4 font-black">Category</th>
                 <th className="p-4 font-black text-right">Quantity Sold</th>
                 <th className="p-4 font-black text-right">Sales Amount</th>
               </tr>
             </thead>
             <tbody className="text-xs text-white/80 divide-y divide-white/5">
               {(() => {
                 const prodMap: Record<string, {name: string, cat: string, qty: number, amt: number}> = {};
                 filteredInvoices.forEach(inv => {
                   if (inv.items) {
                     inv.items.forEach(it => {
                       const key = it.modelNumber || it.lensCategory || 'Unknown';
                       if (!prodMap[key]) prodMap[key] = {name: it.brand || 'N/A', cat: it.itemType || 'N/A', qty: 0, amt: 0};
                       prodMap[key].qty += (it.quantity || 1);
                       prodMap[key].amt += (it.finalAmount || 0);
                     });
                   }
                 });
                 const sorted = Object.values(prodMap).sort((a,b) => b.amt - a.amt).slice(0, 10);
                 if (sorted.length === 0) return <tr><td colSpan={4} className="p-8 text-center text-white/40">No product data found.</td></tr>;
                 return sorted.map((p, i) => (
                   <tr key={i} className="hover:bg-white/5 transition-colors">
                     <td className="p-4">{p.name}</td>
                     <td className="p-4">{p.cat}</td>
                     <td className="p-4 text-right font-bold">{p.qty}</td>
                     <td className="p-4 text-right font-bold text-emerald-400">{formatMoney(p.amt)}</td>
                   </tr>
                 ));
               })()}
             </tbody>
           </table>
         </div>
      </div>

      {/* CUSTOMER REPORT */}
      <div className="bg-[#0F172A] rounded-2xl border border-white/5 shadow-xl overflow-hidden">
         <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1E293B]/50">
           <h2 className="text-sm font-bold text-white flex items-center gap-2"><Users size={16} className="text-orange-400"/> Customer Analytics</h2>
         </div>
         <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-white/5 text-[10px] uppercase tracking-wider text-white/50 border-b border-white/10">
                 <th className="p-4 font-black">Customer Name</th>
                 <th className="p-4 font-black">Mobile</th>
                 <th className="p-4 font-black text-right">Total Purchases</th>
                 <th className="p-4 font-black text-right">Last Purchase Date</th>
               </tr>
             </thead>
             <tbody className="text-xs text-white/80 divide-y divide-white/5">
               {(() => {
                 const custMap: Record<string, {name: string, mob: string, purchases: number, lastDate: number}> = {};
                 filteredInvoices.forEach(inv => {
                   if (!custMap[inv.customerId]) {
                     const c = reactiveCustomers.find(cx => cx.id === inv.customerId);
                     custMap[inv.customerId] = {
                       name: c ? c.name : inv.customerId,
                       mob: c ? (c.mobile || 'N/A') : 'N/A',
                       purchases: 0,
                       lastDate: 0
                     };
                   }
                   custMap[inv.customerId].purchases += inv.grandTotal;
                   if (inv.createdAt > custMap[inv.customerId].lastDate) {
                     custMap[inv.customerId].lastDate = inv.createdAt;
                   }
                 });
                 const sorted = Object.values(custMap).sort((a,b) => b.purchases - a.purchases).slice(0, 10);
                 if (sorted.length === 0) return <tr><td colSpan={4} className="p-8 text-center text-white/40">No customer activity.</td></tr>;
                 return sorted.map((c, i) => (
                   <tr key={i} className="hover:bg-white/5 transition-colors">
                     <td className="p-4 font-bold text-white">{c.name}</td>
                     <td className="p-4 text-white/60">{c.mob}</td>
                     <td className="p-4 text-right font-bold text-emerald-400">{formatMoney(c.purchases)}</td>
                     <td className="p-4 text-right">{new Date(c.lastDate).toLocaleDateString()}</td>
                   </tr>
                 ));
               })()}
             </tbody>
           </table>
         </div>
      </div>


      {/* SALES REPORT TABLE */}
      <div className="bg-[#0F172A] rounded-2xl border border-white/5 shadow-xl overflow-hidden">
         <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1E293B]/50">
           <h2 className="text-sm font-bold text-white flex items-center gap-2"><FileText size={16} className="text-pink-400"/> Sales Report Table</h2>
           <span className="text-xs text-white/50">{filteredInvoices.length} records</span>
         </div>
         <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="bg-white/5 text-[10px] uppercase tracking-wider text-white/50 border-b border-white/10">
                 <th className="p-4 font-black">Date</th>
                 <th className="p-4 font-black">Invoice</th>
                 <th className="p-4 font-black">Customer</th>
                 <th className="p-4 font-black">Type</th>
                 <th className="p-4 font-black text-right">Amount</th>
                 <th className="p-4 font-black">Payment</th>
                 <th className="p-4 font-black">Status</th>
               </tr>
             </thead>
             <tbody className="text-xs text-white/80 divide-y divide-white/5">
               {filteredInvoices.length === 0 ? (
                 <tr><td colSpan={6} className="p-8 text-center text-white/40">No report data available for the selected branch and date range.</td></tr>
               ) : (
                 filteredInvoices.sort((a,b) => b.createdAt - a.createdAt).map(inv => {
                   const cust = reactiveCustomers.find(c => c.id === inv.customerId);
                   return (
                     <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                       <td className="p-4 whitespace-nowrap">{new Date(inv.createdAt).toLocaleDateString()}</td>
                       <td className="p-4 font-mono text-cyan-400">{inv.invoiceNumber}</td>
                       <td className="p-4">{cust ? cust.name : inv.customerId}</td>
                       <td className="p-4">
                         <span className={`px-2 py-1 rounded text-[10px] font-bold ${inv.type === 'Direct Sale' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                           {inv.type}
                         </span>
                       </td>
                       <td className="p-4 text-right font-bold text-white">{formatMoney(inv.grandTotal)}</td>
                       <td className="p-4">
                         {inv.paymentDetail?.cash ? 'Cash ' : ''}
                         {inv.paymentDetail?.card ? 'Card ' : ''}
                         {inv.paymentDetail?.upi ? 'UPI ' : ''}
                         {!(inv.paymentDetail?.cash || inv.paymentDetail?.card || inv.paymentDetail?.upi) ? 'N/A' : ''}
                       </td>
                       <td className="p-4">
                         <span className={`px-2 py-1 rounded text-[10px] font-bold ${inv.status === 'Delivered' ? 'text-emerald-400' : 'text-orange-400'}`}>
                           {inv.status}
                         </span>
                       </td>
                     </tr>
                   )
                 })
               )}
             </tbody>
           </table>
         </div>
      </div>
    </div>
  );
}
