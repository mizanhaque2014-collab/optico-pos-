"use client";
import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !session && pathname !== '/login') {
      router.replace('/login');
    }
  }, [session, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <p className="text-white/40 font-bold uppercase tracking-widest text-xs animate-pulse">Verifying Authentication...</p>
      </div>
    );
  }

  if (!session) {
    // Return null while redirecting
    return null;
  }

  return <>{children}</>;
}
