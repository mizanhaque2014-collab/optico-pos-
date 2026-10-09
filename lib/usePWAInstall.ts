"use client";

import { useEffect, useState, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface Window {
    __pwaDeferredPrompt?: BeforeInstallPromptEvent | null;
    __pwaIsInstalled?: boolean;
  }
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);

    if (typeof window === 'undefined') return;

    // 1. Register Service Worker
    if ('serviceWorker' in navigator) {
      const registerSW = () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('[PWA] Service Worker registered successfully, scope:', registration.scope);
          })
          .catch((error) => {
            console.warn('[PWA] Service Worker registration failed:', error);
          });
      };

      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
      }
    }

    // 2. Check if already running in standalone mode (installed app)
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isStandaloneNavigator = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      const isDocumentStandalone = (document.referrer.includes('android-app://'));
      const installed = Boolean(isStandaloneMedia || isStandaloneNavigator || isDocumentStandalone || window.__pwaIsInstalled);
      setIsInstalled(installed);
      return installed;
    };

    const alreadyInstalled = checkStandalone();

    // 3. Detect iOS / iPadOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isIOSDevice);

    // 4. Check if global prompt already captured
    if (window.__pwaDeferredPrompt && !alreadyInstalled) {
      setDeferredPrompt(window.__pwaDeferredPrompt);
    }

    // 5. Event Listeners
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent browser default mini-infobar
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__pwaDeferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
      console.log('[PWA] beforeinstallprompt captured and ready');
    };

    const handleAppInstalled = () => {
      console.log('[PWA] App successfully installed');
      window.__pwaIsInstalled = true;
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__pwaDeferredPrompt = null;
    };

    // Watch display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      }
    };
  }, []);

  const install = useCallback(async (): Promise<'accepted' | 'dismissed' | 'ios' | 'unavailable'> => {
    if (isInstalled) return 'unavailable';

    if (isIOS) {
      return 'ios';
    }

    const promptEvent = deferredPrompt || (typeof window !== 'undefined' ? window.__pwaDeferredPrompt : null);

    if (!promptEvent) {
      console.warn('[PWA] Install prompt not available yet');
      return 'unavailable';
    }

    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      console.log('[PWA] User choice outcome:', choice.outcome);

      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        if (typeof window !== 'undefined') {
          window.__pwaDeferredPrompt = null;
        }
        return 'accepted';
      }
      return 'dismissed';
    } catch (err) {
      console.error('[PWA] Error during prompt execution:', err);
      return 'unavailable';
    }
  }, [deferredPrompt, isInstalled, isIOS]);

  // Install is available if:
  // - Component is mounted AND
  // - App is not already running standalone AND
  // - Either we have the native deferred prompt OR it's iOS Safari
  const isInstallAvailable = isMounted && !isInstalled && (Boolean(deferredPrompt) || isIOS);

  return {
    isMounted,
    isInstalled,
    isInstallAvailable,
    isInstallable: Boolean(deferredPrompt),
    isIOS,
    install,
  };
}
