'use client';

import { useState, useEffect } from 'react';
import { DashboardView } from '@/components/DashboardView';
import { InvoiceFormView } from '@/components/InvoiceFormView';
import { DeliveryCollectionView } from '@/components/DeliveryCollectionView';
import { CustomersView } from '@/components/CustomersView';
import { StockInventoryView } from '@/components/StockInventoryView';
import { DailySalesReportView } from '@/components/DailySalesReportView';
import { WhatsAppMarketingView } from '@/components/WhatsAppMarketingView';
import { EyeTestFormView } from '@/components/EyeTestFormView';
import { ArrowLeft, Settings, Building, Save, Globe } from 'lucide-react';
import { runApiDiagnostics } from '@/lib/apiTest';
import { saveShopProfile } from '@/lib/shopConfig';
import { saveApiUrl } from '@/lib/config';

export type ViewState = 'dashboard' | 'sales_order' | 'direct_sale' | 'delivery_collection' | 'customers' | 'stock_inventory' | 'daily_sales_report' | 'whatsapp_marketing' | 'eye_test';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [preloadedEyeTest, setPreloadedEyeTest] = useState<any>(null);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [tempShopProfile, setTempShopProfile] = useState<any>({
    shopName: '',
    addressLine1: '',
    addressLine2: '',
    mobile: '',
    whatsapp: '',
    email: '',
    gstin: '',
    logo: ''
  });
  const [tempApiUrl, setTempApiUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const custom = localStorage.getItem('opt_shop_profile');
      const savedApi = localStorage.getItem('opt_api_url') || 'https://script.google.com/macros/s/AKfycbw279jQdZtQPJEzDFxb1oC59Xn6OALuo6f8Z_I5IGaCsOz5Vu_vuP0HZis1yghgVeRc-g/exec';
      setTempApiUrl(savedApi);
      if (custom) {
        try {
          const parsed = JSON.parse(custom);
          setTempShopProfile({
            shopName: parsed.shopName || 'OPTICO POS',
            addressLine1: parsed.addressLine1 || 'Primary Optical Hub',
            addressLine2: parsed.addressLine2 || 'Central Business District',
            mobile: parsed.mobile || '9999999999',
            whatsapp: parsed.whatsapp || '9999999999',
            email: parsed.email || 'info@opticopos.com',
            gstin: parsed.gstin || '',
            logo: parsed.logo || ''
          });
        } catch (_) {}
      } else {
        setTempShopProfile({
          shopName: 'OPTICO POS',
          addressLine1: 'Primary Optical Hub',
          addressLine2: 'Central Business District',
          mobile: '9999999999',
          whatsapp: '9999999999',
          email: 'info@opticopos.com',
          gstin: '',
          logo: ''
        });
      }
    }
  }, [showSettingsModal]);

  useEffect(() => {
    // Keyboard shortcut (Ctrl + Shift + O) to open Super Admin Portal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === 'O') {
        e.preventDefault();
        window.location.href = '/super-admin';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigateTo = (view: ViewState, customer?: any, eyeTest?: any) => {
    setSelectedCustomer(customer || null);
    setPreloadedEyeTest(eyeTest || null);
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-cyan-500/30 flex flex-col overflow-hidden">
      <header className="flex items-center justify-between px-6 py-3 bg-[#0F172A] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-4">
          {currentView !== 'dashboard' && (
            <button
              onClick={() => navigateTo('dashboard')}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <div className="text-2xl">👓</div>
          <h1 className="text-xl font-bold tracking-tight text-cyan-400">
            OPTICAL POS <span className="text-xs font-normal text-white/50 ml-2">v2.0 • Main Branch</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-lg text-[11px] font-semibold text-white/90 transition-all flex items-center gap-1.5 active:scale-95"
            title="Configure Shop Profile & API Settings"
          >
            <Settings size={14} className="text-cyan-400" />
            Shop Settings
          </button>
          <button
            onClick={() => {
              console.clear();
              runApiDiagnostics();
            }}
            className="px-3 py-1.5 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800/80 rounded-lg text-[11px] font-semibold text-cyan-300 transition-all flex items-center gap-1.5 active:scale-95"
            title="Rerun Google Apps Script API Connection Tests"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            Test Connection
          </button>
          <div className="text-[10px] font-bold text-white/40 flex items-center gap-2 tracking-widest uppercase">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>OPERATOR: ADMIN</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex flex-col p-6 gap-6 bg-[#020617] overflow-y-auto">
          {currentView === 'dashboard' && <DashboardView onViewChange={navigateTo} />}
          {currentView === 'sales_order' && <InvoiceFormView type="Sales Order" initialCustomer={selectedCustomer} preloadedEyeTest={preloadedEyeTest} onBack={() => navigateTo('customers', selectedCustomer)} />}
          {currentView === 'direct_sale' && <InvoiceFormView type="Direct Sale" initialCustomer={selectedCustomer} preloadedEyeTest={preloadedEyeTest} onBack={() => navigateTo('customers', selectedCustomer)} />}
          {currentView === 'delivery_collection' && <DeliveryCollectionView onBack={() => navigateTo('dashboard')} />}
          {currentView === 'customers' && <CustomersView onBack={() => navigateTo('dashboard')} onNavigateTo={navigateTo} />}
          {currentView === 'eye_test' && selectedCustomer && <EyeTestFormView customer={selectedCustomer} onBack={() => navigateTo('customers', selectedCustomer)} onContinueToBilling={(cust, et, billingType) => navigateTo(billingType, cust, et)} />}
          {currentView === 'stock_inventory' && <StockInventoryView onBack={() => navigateTo('dashboard')} />}
          {currentView === 'daily_sales_report' && <DailySalesReportView onBack={() => navigateTo('dashboard')} />}
          {currentView === 'whatsapp_marketing' && <WhatsAppMarketingView onBack={() => navigateTo('dashboard')} />}
        </main>
      </div>

      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-900 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="text-cyan-400" size={20} />
                <h2 className="text-lg font-bold text-white uppercase tracking-tight">Shop Profile & SaaS Config</h2>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-white/40 hover:text-white transition-colors text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs text-white">
              <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider">
                  <Globe size={14} />
                  <span>Google Apps Script Endpoint</span>
                </div>
                <p className="text-white/40 text-[10px]">
                  Provide your client-specific deployed Google Apps Script URL. Each tenant connects to their own secure spreadsheet database.
                </p>
                <div className="space-y-1">
                  <label className="text-white/60 font-medium">APPS_SCRIPT_API_URL</label>
                  <input
                    type="text"
                    value={tempApiUrl}
                    onChange={(e) => setTempApiUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full bg-slate-950/80 border border-white/15 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-cyan-500 placeholder:text-white/20"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider">
                  <Building size={14} />
                  <span>Shop Identity Details</span>
                </div>
                <p className="text-white/40 text-[10px]">
                  This dynamic shop profile automatically formats on A5 invoices, cash receipts, sales reports, and WhatsApp communication templates.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-white/60 font-medium">Shop / Company Name</label>
                    <input
                      type="text"
                      value={tempShopProfile.shopName}
                      onChange={(e) => setTempShopProfile({ ...tempShopProfile, shopName: e.target.value })}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/60 font-medium">Logo URL (Optional)</label>
                    <input
                      type="text"
                      value={tempShopProfile.logo}
                      onChange={(e) => setTempShopProfile({ ...tempShopProfile, logo: e.target.value })}
                      placeholder="https://example.com/logo.png"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-cyan-500 placeholder:text-white/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/60 font-medium">Address Line 1 (Branch Name)</label>
                    <input
                      type="text"
                      value={tempShopProfile.addressLine1}
                      onChange={(e) => setTempShopProfile({ ...tempShopProfile, addressLine1: e.target.value })}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/60 font-medium">Address Line 2 (Street Info)</label>
                    <input
                      type="text"
                      value={tempShopProfile.addressLine2}
                      onChange={(e) => setTempShopProfile({ ...tempShopProfile, addressLine2: e.target.value })}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/60 font-medium">Primary Mobile Number</label>
                    <input
                      type="text"
                      value={tempShopProfile.mobile}
                      onChange={(e) => setTempShopProfile({ ...tempShopProfile, mobile: e.target.value })}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/60 font-medium">WhatsApp Notification Number</label>
                    <input
                      type="text"
                      value={tempShopProfile.whatsapp}
                      onChange={(e) => setTempShopProfile({ ...tempShopProfile, whatsapp: e.target.value })}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/60 font-medium">Email Address</label>
                    <input
                      type="email"
                      value={tempShopProfile.email}
                      onChange={(e) => setTempShopProfile({ ...tempShopProfile, email: e.target.value })}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-white/60 font-medium">GSTIN Number (Tax Register)</label>
                    <input
                      type="text"
                      value={tempShopProfile.gstin}
                      onChange={(e) => setTempShopProfile({ ...tempShopProfile, gstin: e.target.value })}
                      placeholder="e.g. 19XXXXXXXXXX1Z1"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2 px-3 focus:outline-none focus:border-cyan-500 placeholder:text-white/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-900 border-t border-white/5 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  saveShopProfile(tempShopProfile);
                  const currentSavedApi = localStorage.getItem('opt_api_url') || 'https://script.google.com/macros/s/AKfycbw279jQdZtQPJEzDFxb1oC59Xn6OALuo6f8Z_I5IGaCsOz5Vu_vuP0HZis1yghgVeRc-g/exec';
                  if (tempApiUrl.trim() !== currentSavedApi.trim()) {
                    saveApiUrl(tempApiUrl);
                  } else {
                    setShowSettingsModal(false);
                    window.location.reload();
                  }
                }}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5"
              >
                <Save size={14} />
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

