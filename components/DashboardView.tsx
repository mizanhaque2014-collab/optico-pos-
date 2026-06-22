'use client';

import { ViewState } from '@/app/page';
import { ShoppingCart, FileText, CheckCircle, Users, Package, Settings, BarChart3, MessageSquare } from 'lucide-react';

interface Props {
  onViewChange: (view: ViewState) => void;
}

export function DashboardView({ onViewChange }: Props) {
  const menuItems = [
    {
      title: 'Direct Sale',
      subtitle: 'Quick checkout for OTC items',
      icon: <ShoppingCart size={48} className="text-emerald-400" />,
      color: 'bg-emerald-900/30 border-emerald-800 hover:bg-emerald-800/40 hover:border-emerald-500',
      action: () => onViewChange('direct_sale'),
    },
    {
      title: 'Sales Order',
      subtitle: 'Create order with prescription',
      icon: <FileText size={48} className="text-blue-400" />,
      color: 'bg-blue-900/30 border-blue-800 hover:bg-blue-800/40 hover:border-blue-500',
      action: () => onViewChange('sales_order'),
    },
    {
      title: 'Delivery Collection',
      subtitle: 'Complete order & collect balance',
      icon: <CheckCircle size={48} className="text-purple-400" />,
      color: 'bg-purple-900/30 border-purple-800 hover:bg-purple-800/40 hover:border-purple-500',
      action: () => onViewChange('delivery_collection'),
    },
    {
      title: 'Customers',
      subtitle: 'Manage client database',
      icon: <Users size={48} className="text-orange-400" />,
      color: 'bg-orange-900/30 border-orange-800 hover:bg-orange-850/40 hover:border-orange-500',
      action: () => onViewChange('customers'),
    },
    {
      title: 'Stock Inventory',
      subtitle: 'Durable Optical Stock & Analytics',
      icon: <Package size={48} className="text-cyan-400" />,
      color: 'bg-cyan-900/30 border-cyan-800 hover:bg-cyan-800/40 hover:border-cyan-500',
      action: () => onViewChange('stock_inventory'),
    },
    {
      title: 'Daily Sales Report',
      subtitle: 'Audit Daily Sales & Store Summary',
      icon: <BarChart3 size={48} className="text-pink-400" />,
      color: 'bg-pink-900/30 border-pink-800 hover:bg-pink-800/40 hover:border-pink-500',
      action: () => onViewChange('daily_sales_report'),
    },
    {
      title: 'WhatsApp Marketing & Campaign',
      subtitle: 'Audit & Launch Customer Campaigns',
      icon: <MessageSquare size={48} className="text-[#10b981]" />,
      color: 'bg-emerald-950/40 border-emerald-800/80 hover:bg-emerald-900/40 hover:border-emerald-500',
      action: () => onViewChange('whatsapp_marketing'),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-8 p-6 bg-[#0F172A] rounded-2xl border border-white/5 backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back! 👋</h2>
        <p className="text-white/40">Select an option below to start a new transaction or manage your store.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {menuItems.map((item) => (
          <button
            key={item.title}
            onClick={item.action}
            className={`flex flex-col items-center justify-center p-8 rounded-2xl border-b-4 transition-all duration-200 group text-center shadow-lg ${item.color}`}
          >
            <div className="mb-4 transform group-hover:scale-110 transition-transform duration-200">
              {item.icon}
            </div>
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">{item.title}</h3>
            <p className="text-white/60 font-bold text-xs uppercase tracking-widest">{item.subtitle}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
