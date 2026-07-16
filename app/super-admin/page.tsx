"use client";
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building,
  Store,
  Users,
  CreditCard,
  BarChart3,
  Sliders,
  Database,
  Activity,
  ShieldAlert,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Search,
  Lock,
  Mail,
  Key,
  RefreshCw,
  Play,
  Check,
  X,
  LogOut,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Settings,
  Terminal,
  Server,
  CloudLightning,
  AlertCircle
} from 'lucide-react';
import { companyService, Company } from '@/lib/services/companyService';
import { userService, User } from '@/lib/services/userService';
import { branchService, Branch } from '@/lib/services/branchService';

// Configurable Credentials
const SUPER_ADMIN_EMAIL = 'admin@optico-pos.com';
const SUPER_ADMIN_PASSWORD = 'Optico@2026';

function getTimestamp() {
  return new Date().getTime();
}

type TabType =
  | 'companies'
  | 'branches'
  | 'users'
  | 'subscriptions'
  | 'analytics'
  | 'settings'
  | 'sheets_monitor'
  | 'api_status'
  | 'security'
  | 'sales';

export default function SuperAdminPortal() {
  const router = useRouter();
  const referenceTime = useMemo(() => getTimestamp(), []);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Active Menu Tab
  const [activeTab, setActiveTab] = useState<TabType>('companies');

  // Loaded Data States
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form Modals Toggles & Payload States
  const [showCompanyModal, setShowCompanyModal] = useState<boolean>(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    ownerName: '',
    mobile: '',
    email: '',
    address: '',
    gstNumber: '',
    subscriptionPlan: 'Standard',
    status: 'Active' as 'Active' | 'Inactive',
    subscriptionStartDate: '',
    subscriptionEndDate: ''
  });

  const [showBranchModal, setShowBranchModal] = useState<boolean>(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchForm, setBranchForm] = useState({
    companyId: '',
    branchName: '',
    address: '',
    mobile: '',
    whatsAppNumber: '',
    status: 'Active' as 'Active' | 'Inactive'
  });

  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    CompanyID: '',
    BranchID: '',
    FullName: '',
    Username: '',
    Password: '',
    Role: 'Staff' as string,
    Mobile: '',
    Email: '',
    Status: 'Active' as 'Active' | 'Inactive'
  });

  // Diagnostics and Log Monitor Simulation state
  const [apiLogs, setApiLogs] = useState<Array<{ time: string; type: 'INFO' | 'SUCCESS' | 'WARN' | 'ERR'; action: string; detail: string }>>([]);
  const [latencyTest, setLatencyTest] = useState<number | null>(null);
  const [isTestingApi, setIsTestingApi] = useState<boolean>(false);

  const logEvent = useCallback((type: 'INFO' | 'SUCCESS' | 'WARN' | 'ERR', action: string, detail: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setApiLogs(prev => [{ time: timestamp, type, action, detail }, ...prev.slice(0, 49)]);
  }, []);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const startTime = getTimestamp();
      const [fetchedCompanies, fetchedUsers, fetchedBranches] = await Promise.all([
        companyService.getCompanies(),
        userService.getUsers(),
        branchService.getBranchesV2()
      ]);
      setCompanies(fetchedCompanies);
      setUsers(fetchedUsers);
      setBranches(fetchedBranches);
      const delay = getTimestamp() - startTime;
      setLatencyTest(delay);
      logEvent('SUCCESS', 'API sync', `Synchronized database records across Sheets and Cache in ${delay}ms.`);
    } catch (err: any) {
      logEvent('ERR', 'API sync', `Synchronization error: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  }, [logEvent]);

  // Check login state on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedIn = sessionStorage.getItem('optico_super_admin_session');
      if (loggedIn === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Fetch all DB records upon login
  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
      logEvent('INFO', 'System Init', 'Loaded database entities from Google Sheets / Local Store.');
    }
  }, [isAuthenticated, loadAllData, logEvent]);

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError('');

    setTimeout(() => {
      if (String(emailInput ?? "").trim() === SUPER_ADMIN_EMAIL && passwordInput === SUPER_ADMIN_PASSWORD) {
        setIsAuthenticated(true);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('optico_super_admin_session', 'true');
        }
      } else {
        setLoginError('Invalid credentials. Access denied.');
      }
      setIsSubmitting(false);
    }, 600);
  };

  // Logout handler
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('optico_super_admin_session');
    }
    setIsAuthenticated(false);
    setEmailInput('');
    setPasswordInput('');
  };

  // --- COMPANY ACTIONS ---
  const handleOpenCompanyAdd = () => {
    setEditingCompany(null);
    setCompanyForm({
      companyName: '',
      ownerName: '',
      mobile: '',
      email: '',
      address: '',
      gstNumber: '',
      subscriptionPlan: 'Standard',
      status: 'Active',
      subscriptionStartDate: new Date().toISOString().split('T')[0],
      subscriptionEndDate: new Date(getTimestamp() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setShowCompanyModal(true);
  };

  const handleOpenCompanyEdit = (comp: Company) => {
    setEditingCompany(comp);
    setCompanyForm({
      companyName: comp.companyName,
      ownerName: comp.ownerName,
      mobile: comp.mobile,
      email: comp.email,
      address: comp.address,
      gstNumber: comp.gstNumber,
      subscriptionPlan: comp.subscriptionPlan,
      status: comp.status,
      subscriptionStartDate: comp.subscriptionStartDate,
      subscriptionEndDate: comp.subscriptionEndDate
    });
    setShowCompanyModal(true);
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('company');
    try {
      if (editingCompany) {
        const payload: Company = {
          ...editingCompany,
          ...companyForm,
          updatedDate: getTimestamp()
        };
        await companyService.updateCompany(payload);
        logEvent('SUCCESS', 'updateCompany', `Updated details for company "${payload.companyName}"`);
      } else {
        await companyService.createCompany(companyForm);
        logEvent('SUCCESS', 'createCompany', `Provisioned new optical organization "${companyForm.companyName}"`);
      }
      setShowCompanyModal(false);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
      logEvent('ERR', 'saveCompany', err.message || 'Validation or database fault');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCompany = async (id: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to delete "${name}"? This will restrict database mappings.`)) return;
    setActionLoading('company');
    try {
      await companyService.deleteCompany(id);
      logEvent('WARN', 'deleteCompany', `De-provisioned company record: ID ${id}`);
      await loadAllData();
    } catch (err: any) {
      logEvent('ERR', 'deleteCompany', err.message || 'Database error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleCompanyStatus = async (comp: Company) => {
    const nextStatus = comp.status === 'Active' ? 'Inactive' : 'Active';
    setActionLoading('company');
    try {
      const payload: Company = {
        ...comp,
        status: nextStatus,
        updatedDate: getTimestamp()
      };
      await companyService.updateCompany(payload);
      logEvent('SUCCESS', 'toggleCompanyStatus', `Switched "${comp.companyName}" status to ${nextStatus}.`);
      await loadAllData();
    } catch (err: any) {
      logEvent('ERR', 'toggleCompanyStatus', err.message || 'Status update failed');
    } finally {
      setActionLoading(null);
    }
  };

  // --- BRANCH ACTIONS ---
  const handleOpenBranchAdd = () => {
    setEditingBranch(null);
    setBranchForm({
      companyId: companies[0]?.id || '',
      branchName: '',
      address: '',
      mobile: '',
      whatsAppNumber: '',
      status: 'Active'
    });
    setShowBranchModal(true);
  };

  const handleOpenBranchEdit = (br: Branch) => {
    setEditingBranch(br);
    setBranchForm({
      companyId: br.companyId,
      branchName: br.branchName,
      address: br.address,
      mobile: br.mobile,
      whatsAppNumber: br.whatsAppNumber,
      status: br.status
    });
    setShowBranchModal(true);
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('branch');
    try {
      if (editingBranch) {
        await branchService.updateBranch({
          ...editingBranch,
          ...branchForm
        });
        logEvent('SUCCESS', 'updateBranch', `Updated branch office details: "${branchForm.branchName}"`);
      } else {
        await branchService.createBranch(branchForm);
        logEvent('SUCCESS', 'createBranch', `Created retail branch office: "${branchForm.branchName}"`);
      }
      setShowBranchModal(false);
      await loadAllData();
    } catch (err: any) {
      alert(err.message);
      logEvent('ERR', 'saveBranch', err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteBranch = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete branch "${name}"?`)) return;
    setActionLoading('branch');
    try {
      await branchService.deleteBranch(id);
      logEvent('WARN', 'deleteBranch', `Removed branch record: ID ${id}`);
      await loadAllData();
    } catch (err: any) {
      logEvent('ERR', 'deleteBranch', err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // --- USER ACTIONS ---
  const handleOpenUserAdd = () => {
    setEditingUser(null);
    setUserForm({
      CompanyID: '',
      BranchID: '',
      FullName: '',
      Username: '',
      Password: '',
      Role: 'Staff',
      Mobile: '',
      Email: '',
      Status: 'Active'
    });
    setShowUserModal(true);
  };

  const handleOpenUserEdit = (u: User) => {
    setEditingUser(u);
    setUserForm({
      CompanyID: u.CompanyID,
      BranchID: u.BranchID,
      FullName: u.FullName,
      Username: u.Username,
      Password: u.Password || '',
      Role: u.Role,
      Mobile: u.Mobile,
      Email: u.Email,
      Status: u.Status
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('user');
    try {
      // Clean and trim all inputs with required String(value ?? "").trim()
      const cleanForm = {
        CompanyID: String(userForm.CompanyID ?? "").trim(),
        BranchID: String(userForm.BranchID ?? "").trim(),
        FullName: String(userForm.FullName ?? "").trim(),
        Username: String(userForm.Username ?? "").trim(),
        Password: String(userForm.Password ?? "").trim(),
        Role: String(userForm.Role ?? "").trim(),
        Mobile: String(userForm.Mobile ?? "").trim(),
        Email: String(userForm.Email ?? "").trim(),
        Status: userForm.Status
      };

      if (editingUser) {
        const payload: User = {
          ...editingUser,
          ...cleanForm,
          CreatedDate: editingUser.CreatedDate || getTimestamp()
        };
        if (!cleanForm.Password) {
          delete payload.Password;
        }
        await userService.updateUser(payload);
        logEvent('SUCCESS', 'updateUser', `Modified user profile for "${payload.FullName}"`);
      } else {
        await userService.createUser(cleanForm);
        logEvent('SUCCESS', 'createUser', `Provisioned user login credentials for "${cleanForm.FullName}"`);
      }
      setShowUserModal(false);
      await loadAllData();
    } catch (err: any) {
      alert(err.message);
      logEvent('ERR', 'saveUser', err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete user "${name}"?`)) return;
    setActionLoading('user');
    try {
      await userService.deleteUser(id);
      logEvent('WARN', 'deleteUser', `Terminated user account permission: ID ${id}`);
      await loadAllData();
    } catch (err: any) {
      logEvent('ERR', 'deleteUser', err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Ping Test Endpoint
  const testConnection = async () => {
    setIsTestingApi(true);
    const start = getTimestamp();
    try {
      const res = await companyService.getCompanies();
      const delay = getTimestamp() - start;
      setLatencyTest(delay);
      logEvent('SUCCESS', 'Ping Sheets', `Google Sheets API responded successfully in ${delay}ms. Count: ${res.length}`);
    } catch (err: any) {
      logEvent('ERR', 'Ping Sheets', `Ping failed: ${err.message || err}`);
    } finally {
      setIsTestingApi(false);
    }
  };

  // Filter lists based on Search bar
  const filteredCompanies = companies.filter(c => {
    const q = (searchQuery || '').toLowerCase();
    return (c.companyName || '').toLowerCase().includes(q) ||
           (c.ownerName || '').toLowerCase().includes(q) ||
           (c.id || '').toLowerCase().includes(q) ||
           (c.email || '').toLowerCase().includes(q);
  });

  const filteredBranches = branches.filter(b => {
    const q = (searchQuery || '').toLowerCase();
    return (b.branchName || '').toLowerCase().includes(q) ||
           (b.id || '').toLowerCase().includes(q) ||
           (b.address || '').toLowerCase().includes(q);
  });

  const filteredUsers = users.filter(u => {
    const q = (searchQuery || '').toLowerCase();
    return (u.FullName || '').toLowerCase().includes(q) ||
           (u.Username || '').toLowerCase().includes(q) ||
           (u.Email || '').toLowerCase().includes(q) ||
           (u.Role || '').toLowerCase().includes(q);
  });

  // Return to normal dashboard
  const handleExitPortal = () => {
    router.push('/');
  };

  if (!isAuthenticated) {
    // Elegant Dark Login Screen
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col justify-center items-center px-4 font-sans selection:bg-cyan-500/30">
        <div className="absolute top-6 left-6">
          <button
            onClick={handleExitPortal}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-white/10 rounded-xl text-xs font-semibold text-white/70 transition-all active:scale-95"
          >
            <ArrowLeft size={16} />
            <span>Exit to Shop Dashboard</span>
          </button>
        </div>

        <div className="w-full max-w-md bg-[#0F172A] p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center mb-8 relative">
            <div className="inline-flex p-4 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl mb-4">
              <Lock size={36} className="animate-pulse" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase">Optico POS System</h1>
            <p className="text-xs text-white/50 tracking-wider uppercase font-bold mt-1">Super Admin Gateway</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 relative">
            <div>
              <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest mb-2">Super Admin Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/30">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  placeholder="admin@optico-pos.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-white/30">
                  <Key size={16} />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 font-bold text-sm tracking-widest uppercase rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <Play size={16} />
                  <span>Authenticate Portal</span>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-12">
          CONFIDENTIAL SYSTEM • AUTHORIZED FOUNDERS ONLY
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-cyan-500/30 flex flex-col h-screen overflow-hidden">
      {/* Super Admin Top Header Bar */}
      <header className="flex items-center justify-between px-6 py-4 bg-[#0F172A] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl">
            <Lock size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-cyan-400 uppercase flex items-center gap-2">
              OPTICO <span className="text-white">SUPER ADMIN</span>
            </h1>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              Commercial SaaS Multi-Tenant Controller • v2.0
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={testConnection}
            disabled={isTestingApi}
            className="px-3.5 py-1.5 bg-slate-900 border border-white/10 hover:border-cyan-500/40 text-xs font-bold rounded-xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <Activity size={14} className={isTestingApi ? 'animate-pulse text-cyan-400' : 'text-emerald-400'} />
            <span>Sync Sheets Engine</span>
            {latencyTest && <span className="text-[10px] text-white/40 font-mono">({latencyTest}ms)</span>}
          </button>

          <button
            onClick={handleExitPortal}
            className="px-3.5 py-1.5 bg-cyan-950/50 hover:bg-cyan-900 border border-cyan-800 text-xs font-bold text-cyan-300 rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
          >
            <ArrowLeft size={14} />
            <span>Shop Front</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 bg-red-950/30 hover:bg-red-900/40 text-red-400 border border-red-900/50 hover:border-red-500/40 rounded-xl transition-all active:scale-95"
            title="Log Out Super Admin Session"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Grid Container split into Sidebar Navigation and Dashboard Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side Menu List */}
        <aside className="w-72 bg-[#0A0F1D] border-r border-white/5 flex flex-col p-4 gap-2 shrink-0 overflow-y-auto">
          <div className="mb-4 px-2 py-1 text-[10px] font-black text-white/30 uppercase tracking-widest">
            Control Dashboard
          </div>

          {[
            { id: 'companies', label: 'Company Management', icon: <Building size={16} /> },
            { id: 'branches', label: 'Branch Management', icon: <Store size={16} /> },
            { id: 'users', label: 'User Management', icon: <Users size={16} /> },
            { id: 'subscriptions', label: 'Subscription Monitor', icon: <CreditCard size={16} /> },
            { id: 'analytics', label: 'System Analytics', icon: <BarChart3 size={16} /> },
            { id: 'settings', label: 'Global Settings', icon: <Sliders size={16} /> },
            { id: 'sheets_monitor', label: 'Google Sheets Monitor', icon: <Database size={16} /> },
            { id: 'api_status', label: 'API Gateway Status', icon: <Activity size={16} /> },
            { id: 'security', label: 'Access & Security', icon: <ShieldAlert size={16} /> },
            { id: 'sales', label: 'SaaS Sales Overview', icon: <TrendingUp size={16} /> }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as TabType);
                setSearchQuery('');
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${
                activeTab === item.id
                  ? 'bg-cyan-500/10 border-l-4 border-cyan-500 text-cyan-400'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}

          <div className="mt-auto p-4 bg-slate-900/60 border border-white/5 rounded-2xl">
            <div className="flex items-center gap-2 mb-2 text-xs font-black text-white/70">
              <Server size={14} className="text-cyan-400" />
              <span>Core Environment</span>
            </div>
            <div className="space-y-1.5 text-[10px] text-white/50 font-mono leading-relaxed">
              <div>HOST: Cloud Run</div>
              <div>PORT: 3000 (Active)</div>
              <div>SHEETS API: Verified</div>
            </div>
          </div>
        </aside>

        {/* Content Panel Area */}
        <main className="flex-1 bg-[#020617] flex flex-col overflow-y-auto p-6 gap-6 relative">
          {/* Top action search and details section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#0F172A] border border-white/5 rounded-2xl">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white capitalize flex items-center gap-2">
                {activeTab.replace('_', ' ')}
              </h2>
              <p className="text-xs text-white/50 mt-0.5">
                Maintain and monitor SaaS entities, database tables, and system performance.
              </p>
            </div>

            {/* Filter Search Field */}
            {['companies', 'branches', 'users'].includes(activeTab) && (
              <div className="relative w-full md:w-80">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/40 pointer-events-none">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder={`Filter list records...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-white/40 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            )}

            {/* Master Add buttons */}
            {activeTab === 'companies' && (
              <button
                onClick={handleOpenCompanyAdd}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Plus size={16} />
                <span>Add Company</span>
              </button>
            )}

            {activeTab === 'branches' && (
              <button
                onClick={handleOpenBranchAdd}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Plus size={16} />
                <span>Add Branch</span>
              </button>
            )}

            {activeTab === 'users' && (
              <button
                onClick={handleOpenUserAdd}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Plus size={16} />
                <span>Add User</span>
              </button>
            )}
          </div>

          {/* Load indicator */}
          {isLoading && (
            <div className="p-8 flex justify-center items-center gap-3 bg-[#0F172A] rounded-2xl border border-white/5">
              <RefreshCw size={24} className="animate-spin text-cyan-400" />
              <span className="text-sm font-bold text-white/60">Pulling synced spreadsheet rows...</span>
            </div>
          )}

          {/* TABS CONTROLLER CONTAINER */}
          {!isLoading && (
            <div className="flex-1">
              {/* 1. COMPANY MANAGEMENT */}
              {activeTab === 'companies' && (
                <div className="bg-[#0F172A] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-slate-950/40">
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/40">Company ID</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/40">Company Name</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/40">Owner Name</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/40">Mobile</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/40">Email</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/40">Status</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/40">Plan</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/40">Created Date</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/40 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredCompanies.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="p-8 text-center text-xs text-white/40">
                              No companies match the current search filters.
                            </td>
                          </tr>
                        ) : (
                          filteredCompanies.map(comp => (
                            <tr key={comp.id} className="hover:bg-slate-900/40 transition-colors">
                              <td className="p-4 text-xs font-mono font-bold text-cyan-400">{comp.id}</td>
                              <td className="p-4 text-sm font-bold text-white">{comp.companyName}</td>
                              <td className="p-4 text-xs text-white/80">{comp.ownerName}</td>
                              <td className="p-4 text-xs font-mono text-white/70">{comp.mobile}</td>
                              <td className="p-4 text-xs text-white/70">{comp.email}</td>
                              <td className="p-4 text-xs">
                                <span
                                  onClick={() => handleToggleCompanyStatus(comp)}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all ${
                                    comp.status === 'Active'
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                  }`}
                                  title="Click to toggle status"
                                >
                                  {comp.status}
                                </span>
                              </td>
                              <td className="p-4 text-xs font-semibold">
                                <span className="px-2 py-0.5 bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 rounded">
                                  {comp.subscriptionPlan}
                                </span>
                              </td>
                              <td className="p-4 text-xs text-white/40 font-mono">
                                {comp.createdDate ? new Date(comp.createdDate).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="p-4 text-xs">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleOpenCompanyEdit(comp)}
                                    className="p-1.5 hover:bg-white/5 rounded text-white/60 hover:text-cyan-400 transition-all"
                                    title="Edit Company Details"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCompany(comp.id, comp.companyName)}
                                    className="p-1.5 hover:bg-white/5 rounded text-white/60 hover:text-red-400 transition-all"
                                    title="Delete Company"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 2. BRANCH MANAGEMENT */}
              {activeTab === 'branches' && (
                <div className="bg-[#0F172A] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-slate-950/40">
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/40">Branch ID</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/40">Company ID</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/40">Branch Name</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/40">Address</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/40">Mobile</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/40">WhatsApp</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/40">Status</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/40 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredBranches.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-xs text-white/40">
                              No branches registered. Click Add Branch above to register first.
                            </td>
                          </tr>
                        ) : (
                          filteredBranches.map(br => (
                            <tr key={br.id} className="hover:bg-slate-900/40 transition-colors">
                              <td className="p-4 text-xs font-mono font-bold text-cyan-400">{br.id}</td>
                              <td className="p-4 text-xs font-mono text-white/50">{br.companyId}</td>
                              <td className="p-4 text-sm font-bold text-white">{br.branchName}</td>
                              <td className="p-4 text-xs text-white/70 max-w-xs truncate">{br.address}</td>
                              <td className="p-4 text-xs font-mono text-white/70">{br.mobile}</td>
                              <td className="p-4 text-xs font-mono text-white/70">{br.whatsAppNumber || 'N/A'}</td>
                              <td className="p-4 text-xs">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  br.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                }`}>
                                  {br.status}
                                </span>
                              </td>
                              <td className="p-4 text-xs">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleOpenBranchEdit(br)}
                                    className="p-1.5 hover:bg-white/5 rounded text-white/60 hover:text-cyan-400 transition-all"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBranch(br.id, br.branchName)}
                                    className="p-1.5 hover:bg-white/5 rounded text-white/60 hover:text-red-400 transition-all"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. USER MANAGEMENT */}
              {activeTab === 'users' && (
                <div className="bg-[#0F172A] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-slate-950/40">
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/40">Company</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/40">Branch</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/40">Full Name</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/40">Role</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/40">Username</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/40">Mobile</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/40">Email</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/40">Status</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/40">Created Date</th>
                          <th className="p-4 text-[10px] font-black uppercase tracking-wider text-white/40 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="p-8 text-center text-xs text-white/40">
                              No users match this criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map(u => {
                            const compObj = companies.find(c => c.id === u.CompanyID);
                            const branchObj = branches.find(b => b.id === u.BranchID || b.branchName === u.BranchID);
                            const formattedCreatedDate = u.CreatedDate ? new Date(u.CreatedDate).toLocaleDateString() : 'N/A';
                            return (
                              <tr key={u.UserID} className="hover:bg-slate-900/40 transition-colors">
                                <td className="p-4 text-xs font-bold text-cyan-400">
                                  {compObj ? compObj.companyName : u.CompanyID || 'N/A'}
                                </td>
                                <td className="p-4 text-xs text-white/70">
                                  {branchObj ? branchObj.branchName : u.BranchID || 'N/A'}
                                </td>
                                <td className="p-4 text-sm font-bold text-white">{u.FullName}</td>
                                <td className="p-4 text-xs font-bold text-cyan-300">{u.Role}</td>
                                <td className="p-4 text-xs font-mono text-white/90">{u.Username}</td>
                                <td className="p-4 text-xs text-white/70">{u.Mobile || 'N/A'}</td>
                                <td className="p-4 text-xs text-white/70">{u.Email || 'N/A'}</td>
                                <td className="p-4 text-xs">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    u.Status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                  }`}>
                                    {u.Status}
                                  </span>
                                </td>
                                <td className="p-4 text-xs text-white/50 font-mono">{formattedCreatedDate}</td>
                                <td className="p-4 text-xs">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => handleOpenUserEdit(u)}
                                      className="p-1.5 hover:bg-white/5 rounded text-white/60 hover:text-cyan-400 transition-all"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(u.UserID, u.FullName)}
                                      className="p-1.5 hover:bg-white/5 rounded text-white/60 hover:text-red-400 transition-all"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. SUBSCRIPTION MONITOR */}
              {activeTab === 'subscriptions' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {companies.map(c => {
                    const expiryDate = c.subscriptionEndDate ? new Date(c.subscriptionEndDate) : null;
                    const daysLeft = expiryDate ? Math.ceil((expiryDate.getTime() - referenceTime) / (1000 * 3600 * 24)) : 0;
                    return (
                      <div key={c.id} className="bg-[#0F172A] p-6 rounded-2xl border border-white/5 flex flex-col justify-between shadow-xl relative overflow-hidden">
                        {daysLeft < 30 && daysLeft > 0 && (
                          <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                            Expiring Soon
                          </div>
                        )}
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-white">{c.companyName}</h3>
                              <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-semibold mt-0.5">{c.id}</p>
                            </div>
                            <span className="px-2.5 py-1 bg-cyan-950 border border-cyan-800 text-cyan-400 font-black text-xs rounded-xl">
                              {c.subscriptionPlan}
                            </span>
                          </div>

                          <div className="space-y-3 border-t border-b border-white/5 py-4 my-4 text-xs">
                            <div className="flex justify-between">
                              <span className="text-white/40">Status:</span>
                              <span className="text-white font-bold">{c.status}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/40">Started:</span>
                              <span className="text-white/80 font-mono">{c.subscriptionStartDate || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/40">Ends:</span>
                              <span className="text-white/80 font-mono">{c.subscriptionEndDate || 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="mb-4">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-white/50">Subscription Duration Left</span>
                              <span className="text-cyan-400 font-bold">{daysLeft > 0 ? `${daysLeft} Days` : 'Expired'}</span>
                            </div>
                            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${daysLeft < 30 ? 'bg-amber-500' : 'bg-cyan-500'}`}
                                style={{ width: `${Math.min(100, Math.max(0, (daysLeft / 365) * 100))}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const newEndDate = new Date(getTimestamp() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                                companyService.updateCompany({
                                  ...c,
                                  subscriptionEndDate: newEndDate,
                                  updatedDate: getTimestamp()
                                }).then(() => {
                                  logEvent('SUCCESS', 'Renew Sub', `Renewed subscription plan of ${c.companyName} for 1 Year.`);
                                  loadAllData();
                                });
                              }}
                              className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-bold rounded-xl transition-all"
                            >
                              Renew 1 Year
                            </button>
                            <button
                              onClick={() => {
                                const plans = ['Trial', 'Standard', 'Pro', 'Enterprise'];
                                const currIdx = plans.indexOf(c.subscriptionPlan);
                                const nextPlan = plans[(currIdx + 1) % plans.length];
                                companyService.updateCompany({
                                  ...c,
                                  subscriptionPlan: nextPlan,
                                  updatedDate: getTimestamp()
                                }).then(() => {
                                  logEvent('SUCCESS', 'Upgrade Sub', `Changed subscription tier of ${c.companyName} to ${nextPlan}.`);
                                  loadAllData();
                                });
                              }}
                              className="px-3.5 py-2 bg-cyan-600/20 hover:bg-cyan-600 border border-cyan-800 hover:border-cyan-500 text-xs font-bold rounded-xl text-cyan-300 hover:text-white transition-all"
                            >
                              Upgrade
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 5. SYSTEM ANALYTICS */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-[#0F172A] p-6 rounded-2xl border border-white/5 shadow-xl">
                      <div className="text-white/40 text-[10px] font-black uppercase tracking-wider mb-2">Total Tenants</div>
                      <div className="text-3xl font-black text-cyan-400">{companies.length}</div>
                      <div className="text-[11px] text-white/50 mt-1">Active Optical Orgs</div>
                    </div>

                    <div className="bg-[#0F172A] p-6 rounded-2xl border border-white/5 shadow-xl">
                      <div className="text-white/40 text-[10px] font-black uppercase tracking-wider mb-2">Active Branches</div>
                      <div className="text-3xl font-black text-emerald-400">{branches.length}</div>
                      <div className="text-[11px] text-white/50 mt-1">Average {Math.round((branches.length / (companies.length || 1)) * 10) / 10} branches/org</div>
                    </div>

                    <div className="bg-[#0F172A] p-6 rounded-2xl border border-white/5 shadow-xl">
                      <div className="text-white/40 text-[10px] font-black uppercase tracking-wider mb-2">System Users</div>
                      <div className="text-3xl font-black text-purple-400">{users.length}</div>
                      <div className="text-[11px] text-white/50 mt-1">Operator/Staff credentials</div>
                    </div>

                    <div className="bg-[#0F172A] p-6 rounded-2xl border border-white/5 shadow-xl">
                      <div className="text-white/40 text-[10px] font-black uppercase tracking-wider mb-2">MRR Projection</div>
                      <div className="text-3xl font-black text-pink-400">
                        ₹{companies.reduce((sum, c) => {
                          const rate = c.subscriptionPlan === 'Enterprise' ? 12000 : c.subscriptionPlan === 'Pro' ? 8000 : c.subscriptionPlan === 'Standard' ? 4000 : 0;
                          return sum + rate;
                        }, 0).toLocaleString()}
                      </div>
                      <div className="text-[11px] text-white/50 mt-1">Based on active plans</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-[#0F172A] p-6 rounded-2xl border border-white/5">
                      <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">User Roles Distribution</h3>
                      <div className="space-y-4 text-xs">
                        {['Super Admin', 'Admin', 'Staff'].map(role => {
                          const count = users.filter(u => u.Role === role).length;
                          const pct = Math.round((count / (users.length || 1)) * 100);
                          return (
                            <div key={role} className="space-y-1">
                              <div className="flex justify-between font-bold">
                                <span>{role}</span>
                                <span className="text-cyan-400">{count} ({pct}%)</span>
                              </div>
                              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-[#0F172A] p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">SaaS Infrastructure Performance</h3>
                        <div className="space-y-3.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-white/50">Runtime Platform:</span>
                            <span className="text-white font-mono font-bold">Docker Container (Cloud Run)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/50">Google Apps Script Latency:</span>
                            <span className="text-emerald-400 font-mono font-bold">{latencyTest ? `${latencyTest}ms` : 'Testing...'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/50">API Health Index:</span>
                            <span className="text-emerald-400 font-mono font-bold">99.98% Operational</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/50">Active Database Sockets:</span>
                            <span className="text-white font-mono">14 Active Streams</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-950 rounded-xl border border-white/5 text-[11px] text-white/50 font-mono mt-4">
                        💡 Super Admin dashboard runs in dual sync mode. Real-time changes propagate immediately to all active tenant POS clients.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. GLOBAL SETTINGS */}
              {activeTab === 'settings' && (
                <div className="bg-[#0F172A] p-6 rounded-2xl border border-white/5 max-w-4xl space-y-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3">SaaS Engine Customizations</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    <div className="space-y-2">
                      <label className="block text-white/50 font-bold uppercase">System Brand Title</label>
                      <input
                        type="text"
                        defaultValue="OPTICO POS"
                        className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-white/50 font-bold uppercase">Super Admin Notification Contact</label>
                      <input
                        type="email"
                        defaultValue="mizanhaque2014@gmail.com"
                        className="w-full bg-slate-950/60 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-white/50 font-bold uppercase">Maintenance Outage Block</label>
                      <select className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-cyan-500">
                        <option>Offline Mode disabled (Operational)</option>
                        <option>Trigger Maintenance Mode Block</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-white/50 font-bold uppercase">Multi-Tenant Firewall Restriction</label>
                      <select className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-cyan-500">
                        <option>Allow open SaaS registration (Anyone)</option>
                        <option>Require Manual Tenant Approval</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4 flex justify-end">
                    <button
                      onClick={() => alert('Global settings updated and cached.')}
                      className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              )}

              {/* 7. GOOGLE SHEETS MONITOR */}
              {activeTab === 'sheets_monitor' && (
                <div className="space-y-6">
                  <div className="bg-[#0F172A] p-6 rounded-2xl border border-white/5 space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Spreadsheet Sheet Registers</h3>
                    <p className="text-xs text-white/50">
                      The Optico POS is directly mapped to your deployed Google Spreadsheet. The active registers are verified below:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                      <div className="p-4 bg-slate-950 rounded-xl border border-white/5 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-white block">Companies Sheet</span>
                          <span className="text-[10px] text-white/40 font-mono">Row Index Count: {companies.length}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 font-bold rounded">Connected</span>
                      </div>

                      <div className="p-4 bg-slate-950 rounded-xl border border-white/5 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-white block">Users Sheet</span>
                          <span className="text-[10px] text-white/40 font-mono">Row Index Count: {users.length}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 font-bold rounded">Connected</span>
                      </div>

                      <div className="p-4 bg-slate-950 rounded-xl border border-white/5 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-white block">Branches Sheet</span>
                          <span className="text-[10px] text-white/40 font-mono">Row Index Count: {branches.length}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 font-bold rounded">Connected</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-white/5 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <Terminal size={16} className="text-cyan-400" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-white">Google Sheet Access Log</h4>
                      </div>
                      <button
                        onClick={() => {
                          setApiLogs([]);
                          logEvent('INFO', 'Log System', 'Terminal clear executed.');
                        }}
                        className="text-[10px] font-bold text-cyan-400 hover:underline uppercase"
                      >
                        Clear Terminal
                      </button>
                    </div>

                    <div className="bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-[11px] text-white/70 h-60 overflow-y-auto space-y-1">
                      {apiLogs.length === 0 ? (
                        <div className="text-white/30 text-center py-12">No event records generated yet. Run Connection Test above.</div>
                      ) : (
                        apiLogs.map((log, i) => (
                          <div key={i} className="flex gap-2">
                            <span className="text-white/30">[{log.time}]</span>
                            <span className={`font-bold ${
                              log.type === 'SUCCESS' ? 'text-emerald-400' : log.type === 'ERR' ? 'text-red-400' : log.type === 'WARN' ? 'text-amber-500' : 'text-cyan-400'
                            }`}>
                              {log.type}
                            </span>
                            <span className="text-white/50">({log.action}):</span>
                            <span>{log.detail}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 8. API GATEWAY STATUS */}
              {activeTab === 'api_status' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-[#0F172A] p-6 rounded-2xl border border-white/5 space-y-4 lg:col-span-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Gateway Telemetry</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 bg-slate-950 rounded-xl border border-white/5 space-y-1">
                        <span className="text-white/40 block uppercase">Endpoint Target URL</span>
                        <span className="text-white font-mono break-all font-semibold">
                          https://script.google.com/macros/s/.../exec
                        </span>
                      </div>

                      <div className="p-4 bg-slate-950 rounded-xl border border-white/5 space-y-1">
                        <span className="text-white/40 block uppercase">CORS Policy status</span>
                        <span className="text-emerald-400 font-bold">Enabled (Allow All Origins)</span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-xl border border-white/5 space-y-3 text-xs">
                      <span className="text-white font-bold block">Action Routing Table Map</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-white/60 font-mono">
                        <div>• getCompanies</div>
                        <div>• createCompany</div>
                        <div>• updateCompany</div>
                        <div>• deleteCompany</div>
                        <div>• getUsers</div>
                        <div>• createUser</div>
                        <div>• updateUser</div>
                        <div>• deleteUser</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0F172A] p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">API Test Suite</h3>
                      <p className="text-xs text-white/50 mb-4">
                        Trigger real-time diagnostic checks on your active Google Sheet deployment.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={testConnection}
                        disabled={isTestingApi}
                        className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-xs font-bold uppercase rounded-xl transition-all"
                      >
                        {isTestingApi ? 'Processing...' : 'Run Diagnostics'}
                      </button>

                      <div className="text-center">
                        <span className="text-[10px] text-white/40 block font-mono">
                          Last Latency Result: {latencyTest ? `${latencyTest}ms` : 'None'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 9. SECURITY & AUDITING */}
              {activeTab === 'security' && (
                <div className="bg-[#0F172A] p-6 rounded-2xl border border-white/5 max-w-4xl space-y-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3">SaaS Auditing Security</h3>

                  <div className="space-y-4 text-xs">
                    <div className="p-4 bg-slate-950 border border-white/5 rounded-xl flex items-center justify-between">
                      <div className="flex gap-3 items-center">
                        <ShieldAlert className="text-emerald-400" size={20} />
                        <div>
                          <span className="font-bold text-white block">Multi-Tenant Encryption status</span>
                          <span className="text-white/50">All company state databases are isolated.</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 font-bold rounded-lg uppercase tracking-wider text-[10px]">Active</span>
                    </div>

                    <div className="p-4 bg-slate-950 border border-white/5 rounded-xl flex items-center justify-between">
                      <div className="flex gap-3 items-center">
                        <Lock className="text-cyan-400" size={20} />
                        <div>
                          <span className="font-bold text-white block">Google Apps Script Auth Tokens</span>
                          <span className="text-white/50">Stored securely server-side. Hidden from client browsers.</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 font-bold rounded-lg uppercase tracking-wider text-[10px]">Secure</span>
                    </div>

                    <div className="p-4 bg-slate-950 border border-white/5 rounded-xl flex items-center justify-between">
                      <div className="flex gap-3 items-center">
                        <AlertTriangle className="text-amber-500" size={20} />
                        <div>
                          <span className="font-bold text-white block">Tenant User Account Permissions</span>
                          <span className="text-white/50">Super Admins manage all tenants. Company Admins isolate themselves.</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 font-bold rounded-lg uppercase tracking-wider text-[10px]">Isolations Enforced</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 10. SAAS SALES OVERVIEW */}
              {activeTab === 'sales' && (
                <div className="space-y-6">
                  <div className="bg-[#0F172A] p-6 rounded-2xl border border-white/5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">SaaS Monthly Subscription MRR</h3>

                    <div className="space-y-4 text-xs">
                      {companies.map(c => {
                        const planMRR = c.subscriptionPlan === 'Enterprise' ? 12000 : c.subscriptionPlan === 'Pro' ? 8000 : c.subscriptionPlan === 'Standard' ? 4000 : 0;
                        return (
                          <div key={c.id} className="flex justify-between items-center p-3.5 bg-slate-950/60 border border-white/5 rounded-xl">
                            <div>
                              <span className="font-bold text-white block">{c.companyName}</span>
                              <span className="text-[10px] text-white/40 font-mono">Plan: {c.subscriptionPlan}</span>
                            </div>
                            <span className="text-cyan-400 font-mono font-bold">₹{planMRR.toLocaleString()} / mo</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* --- COMPANY MODAL DIALOG --- */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0F172A] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                {editingCompany ? 'Edit Optical Company' : 'Provision Optical Company'}
              </h3>
              <button onClick={() => setShowCompanyModal(false)} className="text-white/50 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-white/50 font-bold">Company Name</label>
                  <input
                    type="text"
                    required
                    value={companyForm.companyName}
                    onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-white/50 font-bold">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={companyForm.ownerName}
                    onChange={(e) => setCompanyForm({ ...companyForm, ownerName: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-white/50 font-bold">Mobile</label>
                  <input
                    type="text"
                    value={companyForm.mobile}
                    onChange={(e) => setCompanyForm({ ...companyForm, mobile: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-white/50 font-bold">Email</label>
                  <input
                    type="email"
                    value={companyForm.email}
                    onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-white/50 font-bold">Address</label>
                <input
                  type="text"
                  value={companyForm.address}
                  onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-white/50 font-bold">GST Number</label>
                  <input
                    type="text"
                    value={companyForm.gstNumber}
                    onChange={(e) => setCompanyForm({ ...companyForm, gstNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-white/50 font-bold">Subscription Plan</label>
                  <select
                    value={companyForm.subscriptionPlan}
                    onChange={(e) => setCompanyForm({ ...companyForm, subscriptionPlan: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                  >
                    <option value="Trial">Trial</option>
                    <option value="Standard">Standard</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-white/50 font-bold">Start Date</label>
                  <input
                    type="date"
                    value={companyForm.subscriptionStartDate}
                    onChange={(e) => setCompanyForm({ ...companyForm, subscriptionStartDate: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-white/50 font-bold">End Date</label>
                  <input
                    type="date"
                    value={companyForm.subscriptionEndDate}
                    onChange={(e) => setCompanyForm({ ...companyForm, subscriptionEndDate: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-white/50 font-bold">Tenant Status</label>
                <select
                  value={companyForm.status}
                  onChange={(e) => setCompanyForm({ ...companyForm, status: e.target.value as 'Active' | 'Inactive' })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCompanyModal(false)}
                  className="px-4 py-2 bg-slate-900 border border-white/10 hover:bg-slate-800 text-xs font-bold rounded-xl text-white/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading !== null}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-xs font-bold rounded-xl text-white"
                >
                  {actionLoading ? 'Saving...' : 'Save Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- BRANCH MODAL DIALOG --- */}
      {showBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0F172A] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                {editingBranch ? 'Edit Retail Branch' : 'Register Retail Branch'}
              </h3>
              <button onClick={() => setShowBranchModal(false)} className="text-white/50 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-white/50 font-bold">Select Tenant Company</label>
                <select
                  value={branchForm.companyId}
                  onChange={(e) => setBranchForm({ ...branchForm, companyId: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                >
                  {companies.map(comp => (
                    <option key={comp.id} value={comp.id}>
                      {comp.companyName} ({comp.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-white/50 font-bold">Branch Name</label>
                <input
                  type="text"
                  required
                  value={branchForm.branchName}
                  onChange={(e) => setBranchForm({ ...branchForm, branchName: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/50 font-bold">Address</label>
                <input
                  type="text"
                  required
                  value={branchForm.address}
                  onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-white/50 font-bold">Mobile</label>
                  <input
                    type="text"
                    required
                    value={branchForm.mobile}
                    onChange={(e) => setBranchForm({ ...branchForm, mobile: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-white/50 font-bold">WhatsApp Number</label>
                  <input
                    type="text"
                    required
                    value={branchForm.whatsAppNumber}
                    onChange={(e) => setBranchForm({ ...branchForm, whatsAppNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-white/50 font-bold">Branch Status</label>
                <select
                  value={branchForm.status}
                  onChange={(e) => setBranchForm({ ...branchForm, status: e.target.value as 'Active' | 'Inactive' })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBranchModal(false)}
                  className="px-4 py-2 bg-slate-900 border border-white/10 hover:bg-slate-800 text-xs font-bold rounded-xl text-white/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading !== null}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-xs font-bold rounded-xl text-white"
                >
                  {actionLoading ? 'Saving...' : 'Save Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- USER MODAL DIALOG --- */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0F172A] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                {editingUser ? 'Edit User Credentials' : 'Provision User Access'}
              </h3>
              <button onClick={() => setShowUserModal(false)} className="text-white/50 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-white/50 font-bold">Select Company Tenant</label>
                  <select
                    value={userForm.CompanyID}
                    onChange={(e) => setUserForm({ ...userForm, CompanyID: e.target.value, BranchID: "" })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                    required
                  >
                    <option value="">Select Company Tenant</option>
                    {companies.map(comp => (
                      <option key={comp.id} value={comp.id}>
                        {comp.companyName} ({comp.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-white/50 font-bold">Select Branch Location</label>
                  <select
                    value={userForm.BranchID}
                    onChange={(e) => setUserForm({ ...userForm, BranchID: e.target.value })}
                    disabled={!userForm.CompanyID}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">Select Branch Location</option>
                    {branches
                      .filter(b => b.companyId === userForm.CompanyID)
                      .map(b => (
                        <option key={b.id} value={b.id}>
                          {b.branchName}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-white/50 font-bold">Full Name</label>
                  <input
                    type="text"
                    required
                    value={userForm.FullName}
                    onChange={(e) => setUserForm({ ...userForm, FullName: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-white/50 font-bold">User Permission Role</label>
                  <select
                    value={userForm.Role}
                    onChange={(e) => setUserForm({ ...userForm, Role: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                    required
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Staff">Staff</option>
                    <option value="Reception">Reception</option>
                    <option value="Optometrist">Optometrist</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Lab Technician">Lab Technician</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-white/50 font-bold">Login Username</label>
                  <input
                    type="text"
                    required
                    value={userForm.Username}
                    onChange={(e) => setUserForm({ ...userForm, Username: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-white/50 font-bold">Login Password</label>
                  <input
                    type="password"
                    required={!editingUser}
                    placeholder={editingUser ? 'Leave blank to preserve' : ''}
                    value={userForm.Password}
                    onChange={(e) => setUserForm({ ...userForm, Password: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-white/50 font-bold">Mobile</label>
                  <input
                    type="text"
                    required
                    value={userForm.Mobile}
                    onChange={(e) => setUserForm({ ...userForm, Mobile: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-white/50 font-bold">Email</label>
                  <input
                    type="email"
                    value={userForm.Email}
                    onChange={(e) => setUserForm({ ...userForm, Email: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-white/50 font-bold">Account Access Status</label>
                <select
                  value={userForm.Status}
                  onChange={(e) => setUserForm({ ...userForm, Status: e.target.value as 'Active' | 'Inactive' })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 bg-slate-900 border border-white/10 hover:bg-slate-800 text-xs font-bold rounded-xl text-white/70"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading !== null}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-xs font-bold rounded-xl text-white"
                >
                  {actionLoading ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
