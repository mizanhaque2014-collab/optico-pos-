"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { usePWAInstall } from '@/lib/usePWAInstall';
import { Download, Share, PlusSquare, X, Check, Smartphone, Monitor } from 'lucide-react';

interface Props {
  className?: string;
  variant?: 'header' | 'compact' | 'standard';
}

export function PWAInstallButton({ className = '', variant = 'header' }: Props) {
  const { isInstallAvailable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);
  const [justInstalled, setJustInstalled] = useState<boolean>(false);

  // If already installed as standalone PWA, suppress the button completely
  if (isInstalled) {
    return null;
  }

  // Only show when installation is actually available
  if (!isInstallAvailable && !justInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    const result = await install();
    if (result === 'ios') {
      setShowIOSModal(true);
    } else if (result === 'accepted') {
      setJustInstalled(true);
      setTimeout(() => setJustInstalled(false), 5000);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`px-3 py-1.5 bg-gradient-to-r from-emerald-600/90 to-teal-600/90 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400/40 rounded-lg text-[11px] font-bold text-white shadow-sm shadow-emerald-950/40 transition-all flex items-center gap-1.5 active:scale-95 group ${className}`}
        title="Install OPTICO POS as standalone app on Windows, Mac, Android, or iPhone"
      >
        {justInstalled ? (
          <>
            <Check size={14} className="text-emerald-200" />
            <span className="hidden sm:inline">Installed!</span>
          </>
        ) : (
          <>
            <Download size={14} className="text-emerald-200 group-hover:scale-110 transition-transform duration-200" />
            <span className="hidden sm:inline font-bold">Install App</span>
            <span className="sm:hidden font-bold">Install</span>
          </>
        )}
      </button>

      {/* iOS Safari "Add to Home Screen" Instructions Modal */}
      {showIOSModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowIOSModal(false)}
        >
          <div 
            className="bg-[#0F172A] border border-white/10 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-6 text-white relative animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Header with App Icon */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-cyan-500/40 p-1 shadow-lg shadow-cyan-950/50 flex items-center justify-center overflow-hidden relative">
                <Image 
                  src="/icon-192.png" 
                  alt="OPTICO POS" 
                  width={48}
                  height={48}
                  className="w-full h-full object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h3 className="font-bold text-base text-white tracking-tight">Install OPTICO POS</h3>
                <p className="text-[11px] text-cyan-400 font-medium">Add to your iPhone / iPad Home Screen</p>
              </div>
            </div>

            <p className="text-xs text-white/70 mb-5 leading-relaxed">
              Install OPTICO POS to run full-screen with offline support and instant home screen launching:
            </p>

            {/* Visual Steps */}
            <div className="space-y-3.5 mb-6 bg-slate-950/60 p-4 rounded-2xl border border-white/5 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    Tap the <Share size={14} className="text-cyan-400 inline" /> Share button
                  </div>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    Found in the Safari bottom toolbar on iPhone, or top bar on iPad.
                  </p>
                </div>
              </div>

              <div className="w-full h-px bg-white/5" />

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    Select <PlusSquare size={14} className="text-cyan-400 inline" /> &quot;Add to Home Screen&quot;
                  </div>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    Scroll down through the share options menu and tap it.
                  </p>
                </div>
              </div>

              <div className="w-full h-px bg-white/5" />

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <div className="font-semibold text-white">
                    Tap &quot;Add&quot; in the top-right
                  </div>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    OPTICO POS will appear on your device home screen with its official icon.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
