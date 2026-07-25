"use client";
import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Lock, User as UserIcon, LogIn, Activity } from 'lucide-react';
import { shopConfig } from '@/lib/shopConfig';

export function LoginView() {
  const { login, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    
    setIsSubmitting(true);
    try {
      await login(username, password, rememberMe);
    } catch (e) {
      // Error is handled in context and displayed below
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md bg-[#0F172A] border border-white/10 rounded-3xl shadow-2xl p-8 z-10 relative backdrop-blur-sm">
        
        <div className="flex flex-col items-center justify-center mb-10 space-y-4">
           {shopConfig.logo ? (
             <img src={shopConfig.logo} alt="Company Logo" className="h-16 object-contain" />
           ) : (
             <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
               <Activity size={32} className="text-white" />
             </div>
           )}
           <div className="text-center">
             <h1 className="text-2xl font-black text-white tracking-widest uppercase">OPTICO POS</h1>
             <p className="text-xs font-bold text-cyan-400 tracking-wider uppercase mt-1">{shopConfig.shopName}</p>
           </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center animate-in fade-in zoom-in duration-300">
             <p className="text-xs font-black text-rose-400 uppercase tracking-widest">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <UserIcon size={18} className="text-white/40" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-white font-bold tracking-wider placeholder:text-white/20 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-white/40" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full bg-[#1E293B] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm text-white font-bold tracking-wider placeholder:text-white/20 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
             <label className="flex items-center gap-2 cursor-pointer group">
               <input 
                 type="checkbox" 
                 checked={rememberMe}
                 onChange={(e) => setRememberMe(e.target.checked)}
                 className="w-4 h-4 rounded border-white/20 bg-[#1E293B] text-cyan-500 focus:ring-cyan-500/20 focus:ring-offset-0 cursor-pointer"
               />
               <span className="text-xs font-bold text-white/50 group-hover:text-white/80 transition-colors uppercase tracking-wider select-none">Remember Me</span>
             </label>

             <button type="button" className="text-[10px] font-black text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-widest">
               Forgot Password?
             </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black uppercase tracking-widest text-sm py-4 rounded-xl shadow-lg shadow-cyan-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Authenticating...</span>
            ) : (
              <>
                <LogIn size={18} /> Secure Login
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
           <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">OPTICO POS • Version 0.1.0</p>
        </div>
      </div>
    </div>
  );
}
