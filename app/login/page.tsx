"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { LoginView } from '@/components/LoginView';

export default function LoginPage() {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && session) {
      router.push('/');
    }
  }, [session, isLoading, router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#020617]"><p className="text-white/40 font-bold uppercase tracking-widest text-xs animate-pulse">Checking Session...</p></div>;
  }

  return <LoginView />;
}
