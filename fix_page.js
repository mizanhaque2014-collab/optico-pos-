const fs = require('fs');

let code = fs.readFileSync('app/page.tsx', 'utf8');

// Add imports
code = code.replace("import { DashboardView }", "import { useAuth } from '@/lib/AuthContext';\nimport { LoginView } from '@/components/LoginView';\nimport { DashboardView }");

const search = `export default function Home() {`;
const replace = `export default function Home() {
  const { session, isLoading, logout } = useAuth();
`;

code = code.replace(search, replace);

const effectSearch = `  useEffect(() => {
    if (typeof window !== 'undefined') {`;

const effectReplace = `  useEffect(() => {
    if (typeof window !== 'undefined') {`;

const returnSearch = `  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-cyan-500/30">`;

const returnReplace = `  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#020617]"><p className="text-white/40 font-bold uppercase tracking-widest text-xs animate-pulse">Initializing Session...</p></div>;
  }

  if (!session) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-cyan-500/30">`;

code = code.replace(returnSearch, returnReplace);

// We need to inject logout and session details into the header.
const headerSearch = `<div className="flex items-center gap-4">
            <button 
              onClick={() => setShowSettingsModal(true)}
              className="text-white/40 hover:text-white transition-colors bg-white/5 p-2 rounded-xl border border-white/10 hover:border-white/20"
              title="Shop Settings"
            >
              <Building size={18} />
            </button>`;

const headerReplace = `<div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right mr-2">
               <span className="text-xs font-black text-white uppercase tracking-widest">{session.fullName}</span>
               <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider">{session.role.replace('_', ' ')} • {session.branchID}</span>
            </div>
            {session.role === 'SUPER_ADMIN' || session.role === 'COMPANY_ADMIN' ? (
              <button 
                onClick={() => setShowSettingsModal(true)}
                className="text-white/40 hover:text-white transition-colors bg-white/5 p-2 rounded-xl border border-white/10 hover:border-white/20"
                title="Shop Settings"
              >
                <Building size={18} />
              </button>
            ) : null}
            <button 
              onClick={logout}
              className="text-rose-400/70 hover:text-rose-400 transition-colors bg-white/5 p-2 rounded-xl border border-white/10 hover:border-white/20"
              title="Logout"
            >
              <LogOut size={18} />
            </button>`;

code = code.replace(headerSearch, headerReplace);
code = code.replace("import { Building, Settings, RefreshCw, Smartphone, Search, ScanLine, ShoppingCart, UserPlus, Eye, Save, Globe } from 'lucide-react';", "import { Building, Settings, RefreshCw, Smartphone, Search, ScanLine, ShoppingCart, UserPlus, Eye, Save, Globe, LogOut } from 'lucide-react';");

fs.writeFileSync('app/page.tsx', code);
