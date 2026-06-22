'use client';

import { useState } from 'react';
import { DashboardView } from '@/components/DashboardView';
import { InvoiceFormView } from '@/components/InvoiceFormView';
import { DeliveryCollectionView } from '@/components/DeliveryCollectionView';
import { CustomersView } from '@/components/CustomersView';
import { StockInventoryView } from '@/components/StockInventoryView';
import { DailySalesReportView } from '@/components/DailySalesReportView';
import { WhatsAppMarketingView } from '@/components/WhatsAppMarketingView';
import { ArrowLeft } from 'lucide-react';

export type ViewState = 'dashboard' | 'sales_order' | 'direct_sale' | 'delivery_collection' | 'customers' | 'stock_inventory' | 'daily_sales_report' | 'whatsapp_marketing';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const navigateTo = (view: ViewState, customer?: any) => {
    setSelectedCustomer(customer || null);
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
        <div className="text-[10px] font-bold text-white/40 flex items-center gap-2 tracking-widest uppercase">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>OPERATOR: ADMIN</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex flex-col p-6 gap-6 bg-[#020617] overflow-y-auto">
          {currentView === 'dashboard' && <DashboardView onViewChange={navigateTo} />}
          {currentView === 'sales_order' && <InvoiceFormView type="Sales Order" initialCustomer={selectedCustomer} onBack={() => navigateTo('dashboard')} />}
          {currentView === 'direct_sale' && <InvoiceFormView type="Direct Sale" initialCustomer={selectedCustomer} onBack={() => navigateTo('dashboard')} />}
          {currentView === 'delivery_collection' && <DeliveryCollectionView onBack={() => navigateTo('dashboard')} />}
          {currentView === 'customers' && <CustomersView onBack={() => navigateTo('dashboard')} onNavigateTo={navigateTo} />}
          {currentView === 'stock_inventory' && <StockInventoryView onBack={() => navigateTo('dashboard')} />}
          {currentView === 'daily_sales_report' && <DailySalesReportView onBack={() => navigateTo('dashboard')} />}
          {currentView === 'whatsapp_marketing' && <WhatsAppMarketingView onBack={() => navigateTo('dashboard')} />}
        </main>
      </div>
    </div>
  );
}
