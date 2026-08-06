'use client';

import { ViewState } from '@/app/page';
import { useAuth } from '@/lib/AuthContext';
import { ShoppingCart, FileText, CheckCircle, Users, Package, Settings, BarChart3, MessageSquare, Building, Server, Key, ShieldAlert, CreditCard, Search } from 'lucide-react';

interface Props {
  onViewChange: (view: ViewState) => void;
}

export function DashboardView({ onViewChange }: Props) {
  const { session } = useAuth();
  const role = session?.role || 'SHOP_USER';
  const name = session?.fullName || 'User';
  const roleDisplay = role.replace('_', ' ');

  const comingSoonAction = (title: string) => {
    alert(title + " module is currently under development (Backend Integration Pending).");
  };

  let menuItems: any[] = [];

  const commonItems = {
    customers: { title: 'Customers', subtitle: 'Manage client database', icon: <Users size={48} className="text-orange-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-orange-950/80 to-orange-900/40 border-orange-800/50 hover:bg-orange-900/60 hover:border-orange-500/80 shadow-lg shadow-orange-900/20', action: () => onViewChange('customers') },
    inventory: { title: 'Stock Inventory', subtitle: 'Stock & Analytics', icon: <Package size={48} className="text-cyan-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-cyan-950/80 to-cyan-900/40 border-cyan-800/50 hover:bg-cyan-900/60 hover:border-cyan-500/80 shadow-lg shadow-cyan-900/20', action: () => onViewChange('stock_inventory') },
    prescriptions: { title: 'Prescriptions', subtitle: 'Global Records', icon: <FileText size={48} className="text-yellow-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-yellow-950/80 to-yellow-900/40 border-yellow-800/50 hover:bg-yellow-900/60 hover:border-yellow-500/80 shadow-lg shadow-yellow-900/20', action: () => comingSoonAction('Prescriptions') },
    direct_sale: { title: 'Direct Sale', subtitle: 'Quick checkout for OTC items', icon: <ShoppingCart size={48} className="text-emerald-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-emerald-950/80 to-emerald-900/40 border-emerald-800/50 hover:bg-emerald-900/60 hover:border-emerald-500/80 shadow-lg shadow-emerald-900/20', action: () => onViewChange('direct_sale') },
    sales_order: { title: 'Sales Order', subtitle: 'Create order with prescription', icon: <FileText size={48} className="text-blue-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-blue-950/80 to-blue-900/40 border-blue-800/50 hover:bg-blue-900/60 hover:border-blue-500/80 shadow-lg shadow-blue-900/20', action: () => onViewChange('sales_order') },
    delivery_collection: { title: 'Delivery Collection', subtitle: 'Complete order & collect balance', icon: <CheckCircle size={48} className="text-purple-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-purple-950/80 to-purple-900/40 border-purple-800/50 hover:bg-purple-900/60 hover:border-purple-500/80 shadow-lg shadow-purple-900/20', action: () => onViewChange('delivery_collection') },
    payments: { title: 'Payments', subtitle: 'Payment Tracking', icon: <CreditCard size={48} className="text-green-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-green-950/80 to-green-900/40 border-green-800/50 hover:bg-green-900/60 hover:border-green-500/80 shadow-lg shadow-green-900/20', action: () => comingSoonAction('Payments') },
    daily_sales_report: { title: 'Daily Sales Report', subtitle: 'View daily transactions', icon: <BarChart3 size={48} className="text-pink-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-pink-950/80 to-pink-900/40 border-pink-800/50 hover:bg-pink-900/60 hover:border-pink-500/80 shadow-lg shadow-pink-900/20', action: () => onViewChange('daily_sales_report') },
    whatsapp_marketing: { title: 'WhatsApp Marketing & Campaign', subtitle: 'Broadcasts & Offers', icon: <MessageSquare size={48} className="text-emerald-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-emerald-950/80 to-emerald-900/40 border-emerald-800/50 hover:bg-emerald-900/60 hover:border-emerald-500/80 shadow-lg shadow-emerald-900/20', action: () => onViewChange('whatsapp_marketing') },
  };

  if (role === 'SUPER_ADMIN') {
    menuItems = [
      { title: 'Companies', subtitle: 'Manage Tenant Companies', icon: <Building size={48} className="text-purple-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-purple-950/80 to-purple-900/40 border-purple-800/50 hover:bg-purple-900/60 hover:border-purple-500/80 shadow-lg shadow-purple-900/20', action: () => window.location.href = '/super-admin?tab=companies' },
      { title: 'Branches', subtitle: 'Manage Store Branches', icon: <Server size={48} className="text-cyan-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-cyan-950/80 to-cyan-900/40 border-cyan-800/50 hover:bg-cyan-900/60 hover:border-cyan-500/80 shadow-lg shadow-cyan-900/20', action: () => window.location.href = '/super-admin?tab=branches' },
      { title: 'Users', subtitle: 'Manage Role Based Users', icon: <Users size={48} className="text-emerald-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-emerald-950/80 to-emerald-900/40 border-emerald-800/50 hover:bg-emerald-900/60 hover:border-emerald-500/80 shadow-lg shadow-emerald-900/20', action: () => window.location.href = '/super-admin?tab=users' },
      commonItems.customers,
      commonItems.inventory,
      commonItems.prescriptions,
      commonItems.direct_sale,
      commonItems.sales_order,
      commonItems.delivery_collection,
      commonItems.payments,
      { title: 'Reports', subtitle: 'Global Reports', icon: <BarChart3 size={48} className="text-pink-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-pink-950/80 to-pink-900/40 border-pink-800/50 hover:bg-pink-900/60 hover:border-pink-500/80 shadow-lg shadow-pink-900/20', action: () => window.location.href = '/super-admin?tab=analytics' },
      { title: 'Dashboard Analytics', subtitle: 'Advanced Analytics', icon: <BarChart3 size={48} className="text-indigo-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-indigo-950/80 to-indigo-900/40 border-indigo-800/50 hover:bg-indigo-900/60 hover:border-indigo-500/80 shadow-lg shadow-indigo-900/20', action: () => window.location.href = '/super-admin?tab=analytics' },
      { title: 'Shop Settings', subtitle: 'Configure Shop', icon: <Settings size={48} className="text-slate-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-slate-950/80 to-slate-900/40 border-slate-800/50 hover:bg-slate-900/60 hover:border-slate-500/80 shadow-lg shadow-slate-900/20', action: () => window.location.href = '/super-admin?tab=settings' },
      { title: 'System Settings', subtitle: 'Global System Config', icon: <Settings size={48} className="text-gray-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-gray-950/80 to-gray-900/40 border-gray-800/50 hover:bg-gray-900/60 hover:border-gray-500/80 shadow-lg shadow-gray-900/20', action: () => window.location.href = '/super-admin?tab=settings' },
      { title: 'API Configuration', subtitle: 'Manage Endpoint URLs', icon: <Key size={48} className="text-cyan-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-cyan-950/80 to-cyan-900/40 border-cyan-800/50 hover:bg-cyan-900/60 hover:border-cyan-500/80 shadow-lg shadow-cyan-900/20', action: () => window.location.href = '/super-admin?tab=api_status' },
      { title: 'License Management', subtitle: 'Manage Licenses', icon: <ShieldAlert size={48} className="text-rose-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-rose-950/80 to-rose-900/40 border-rose-800/50 hover:bg-rose-900/60 hover:border-rose-500/80 shadow-lg shadow-rose-900/20', action: () => window.location.href = '/super-admin?tab=security' },
    ];
  } else if (role === 'COMPANY_ADMIN') {
    menuItems = [
      { title: 'Company Reports', subtitle: 'Analytics', icon: <BarChart3 size={48} className="text-pink-400 group-hover:scale-110 transition-transform duration-300" />, color: 'bg-gradient-to-br from-pink-950/80 to-pink-900/40 border-pink-800/50 hover:bg-pink-900/60 hover:border-pink-500/80 shadow-lg shadow-pink-900/20', action: () => comingSoonAction('Company Reports') },
      commonItems.whatsapp_marketing,
      commonItems.daily_sales_report,
      commonItems.inventory,
      commonItems.payments,
      commonItems.customers,
      commonItems.sales_order,
      commonItems.direct_sale,
      commonItems.delivery_collection,
    ];
  } else {
    menuItems = [
      commonItems.direct_sale,
      commonItems.sales_order,
      commonItems.delivery_collection,
      commonItems.customers,
      commonItems.inventory,
      commonItems.daily_sales_report,
      commonItems.whatsapp_marketing,
    ];
  }

  return (
    <div className="space-y-6">
      <div className="mb-8 p-6 bg-[#0F172A] rounded-2xl border border-white/5 backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back, {name}! ({roleDisplay}) 👋</h2>
        <p className="text-white/40">Select an option below to start a new transaction or manage your store.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {menuItems.map((item) => (
          <button
            key={item.title}
            onClick={item.action}
            className={`flex flex-col items-center justify-center p-8 rounded-3xl border transition-all duration-300 group text-center backdrop-blur-xl relative overflow-hidden ${item.color}`}
          >
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 mb-6 p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 group-hover:bg-white/10 transition-colors duration-300">
              {item.icon}
            </div>
            <h3 className="relative z-10 text-2xl font-black text-white mb-3 tracking-tight group-hover:text-cyan-300 transition-colors duration-300">{item.title}</h3>
            <p className="relative z-10 text-white/50 font-semibold text-xs tracking-widest uppercase">{item.subtitle}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

