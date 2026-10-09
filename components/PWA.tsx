"use client";

import { useEffect } from 'react';
import { PWAInstallButton } from './PWAInstallButton';

/**
 * PWA Helper Component.
 * Registers the Service Worker and initializes PWA lifecycle listeners.
 * Also re-exports PWAInstallButton for backwards compatibility.
 */
export default function PWA() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.log('[PWA] Service Worker registered via PWA component, scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    }
  }, []);

  return null;
}

export { PWAInstallButton };
