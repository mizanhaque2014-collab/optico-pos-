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
    customers: { title: 'Customers', subtitle: 'Manage client database', icon: <Users size={48} className="text-orange-400" />, color: 'bg-orange-900/30 border-orange-800 hover:bg-orange-850/40 hover:border-orange-500', action: () => onViewChange('customers') },
    inventory: { title: 'Inventory', subtitle: 'Stock & Analytics', icon: <Package size={48} className="text-cyan-400" />, color: 'bg-cyan-900/30 border-cyan-800 hover:bg-cyan-800/40 hover:border-cyan-500', action: () => onViewChange('stock_inventory') },
    prescriptions: { title: 'Prescriptions', subtitle: 'Global Records', icon: <FileText size={48} className="text-yellow-400" />, color: 'bg-yellow-900/30 border-yellow-800 hover:bg-yellow-800/40 hover:border-yellow-500', action: () => comingSoonAction('Prescriptions') },
    direct_sale: { title: 'Direct Sale', subtitle: 'Quick checkout for OTC items', icon: <ShoppingCart size={48} className="text-emerald-400" />, color: 'bg-emerald-900/30 border-emerald-800 hover:bg-emerald-800/40 hover:border-emerald-500', action: () => onViewChange('direct_sale') },
    sales_order: { title: 'Sales Order', subtitle: 'Create order with prescription', icon: <FileText size={48} className="text-blue-400" />, color: 'bg-blue-900/30 border-blue-800 hover:bg-blue-800/40 hover:border-blue-500', action: () => onViewChange('sales_order') },
    delivery_collection: { title: 'Delivery Collection', subtitle: 'Complete order & collect balance', icon: <CheckCircle size={48} className="text-purple-400" />, color: 'bg-purple-900/30 border-purple-800 hover:bg-purple-800/40 hover:border-purple-500', action: () => onViewChange('delivery_collection') },
    payments: { title: 'Payments', subtitle: 'Payment Tracking', icon: <CreditCard size={48} className="text-green-400" />, color: 'bg-green-900/30 border-green-800 hover:bg-green-800/40 hover:border-green-500', action: () => comingSoonAction('Payments') },
  };

  if (role === 'SUPER_ADMIN') {
    menuItems = [
      { title: 'Companies', subtitle: 'Manage Tenant Companies', icon: <Building size={48} className="text-purple-400" />, color: 'bg-purple-900/30 border-purple-800 hover:bg-purple-800/40 hover:border-purple-500', action: () => comingSoonAction('Companies') },
      { title: 'Branches', subtitle: 'Manage Store Branches', icon: <Server size={48} className="text-cyan-400" />, color: 'bg-cyan-900/30 border-cyan-800 hover:bg-cyan-800/40 hover:border-cyan-500', action: () => comingSoonAction('Branches') },
      { title: 'Users', subtitle: 'Manage Role Based Users', icon: <Users size={48} className="text-emerald-400" />, color: 'bg-emerald-900/30 border-emerald-800 hover:bg-emerald-800/40 hover:border-emerald-500', action: () => comingSoonAction('Users') },
      commonItems.customers,
      commonItems.inventory,
      commonItems.prescriptions,
      commonItems.direct_sale,
      commonItems.sales_order,
      commonItems.delivery_collection,
      commonItems.payments,
      { title: 'Reports', subtitle: 'Global Reports', icon: <BarChart3 size={48} className="text-pink-400" />, color: 'bg-pink-900/30 border-pink-800 hover:bg-pink-800/40 hover:border-pink-500', action: () => comingSoonAction('Reports') },
      { title: 'Dashboard Analytics', subtitle: 'Advanced Analytics', icon: <BarChart3 size={48} className="text-indigo-400" />, color: 'bg-indigo-900/30 border-indigo-800 hover:bg-indigo-800/40 hover:border-indigo-500', action: () => comingSoonAction('Dashboard Analytics') },
      { title: 'Shop Settings', subtitle: 'Configure Shop', icon: <Settings size={48} className="text-slate-400" />, color: 'bg-slate-900/30 border-slate-800 hover:bg-slate-800/40 hover:border-slate-500', action: () => comingSoonAction('Shop Settings') },
      { title: 'System Settings', subtitle: 'Global System Config', icon: <Settings size={48} className="text-gray-400" />, color: 'bg-gray-900/30 border-gray-800 hover:bg-gray-800/40 hover:border-gray-500', action: () => comingSoonAction('System Settings') },
      { title: 'License Management', subtitle: 'Manage Licenses', icon: <ShieldAlert size={48} className="text-rose-400" />, color: 'bg-rose-900/30 border-rose-800 hover:bg-rose-800/40 hover:border-rose-500', action: () => comingSoonAction('License Management') },
      { title: 'API Configuration', subtitle: 'Manage Endpoint URLs', icon: <Key size={48} className="text-cyan-400" />, color: 'bg-cyan-900/30 border-cyan-800 hover:bg-cyan-800/40 hover:border-cyan-500', action: () => comingSoonAction('API Configuration') },
      { title: 'Global Search', subtitle: 'Search System', icon: <Search size={48} className="text-yellow-400" />, color: 'bg-yellow-900/30 border-yellow-800 hover:bg-yellow-800/40 hover:border-yellow-500', action: () => comingSoonAction('Global Search') },
    ];
  } else if (role === 'COMPANY_ADMIN') {
    menuItems = [
      commonItems.customers,
      commonItems.inventory,
      commonItems.prescriptions,
      commonItems.direct_sale,
      commonItems.sales_order,
      commonItems.delivery_collection,
      commonItems.payments,
      { title: 'Company Reports', subtitle: 'Analytics', icon: <BarChart3 size={48} className="text-pink-400" />, color: 'bg-pink-900/30 border-pink-800 hover:bg-pink-800/40 hover:border-pink-500', action: () => comingSoonAction('Company Reports') },
      { title: 'Company Users', subtitle: 'Manage Role Based Users', icon: <Users size={48} className="text-emerald-400" />, color: 'bg-emerald-900/30 border-emerald-800 hover:bg-emerald-800/40 hover:border-emerald-500', action: () => comingSoonAction('Company Users') },
      { title: 'Company Branches', subtitle: 'Manage Store Branches', icon: <Server size={48} className="text-cyan-400" />, color: 'bg-cyan-900/30 border-cyan-800 hover:bg-cyan-800/40 hover:border-cyan-500', action: () => comingSoonAction('Company Branches') },
      { title: 'Company Settings', subtitle: 'Company Config', icon: <Settings size={48} className="text-slate-400" />, color: 'bg-slate-900/30 border-slate-800 hover:bg-slate-800/40 hover:border-slate-500', action: () => comingSoonAction('Company Settings') },
    ];
  } else {
    menuItems = [
      commonItems.direct_sale,
      commonItems.sales_order,
      commonItems.delivery_collection,
      commonItems.customers,
      commonItems.prescriptions,
      commonItems.inventory,
      commonItems.payments,
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
            className={`flex flex-col items-center justify-center p-6 rounded-2xl border-b-4 transition-all duration-200 group text-center shadow-lg ${item.color}`}
          >
            <div className="mb-4 transform group-hover:scale-110 transition-transform duration-200">
              {item.icon}
            </div>
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{item.title}</h3>
            <p className="text-white/60 font-bold text-[10px] uppercase tracking-widest">{item.subtitle}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

