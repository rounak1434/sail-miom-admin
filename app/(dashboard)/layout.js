'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DashboardGroupLayout({ children }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  // Wait for the persisted auth store to rehydrate from localStorage before
  // deciding whether to redirect. Otherwise a hard reload (or window.location
  // navigation) sees isAuthenticated=false on the first tick and bounces to
  // /login → /dashboard even though the user is logged in.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) setHydrated(true);
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace('/login');
    }
  }, [hydrated, isAuthenticated, router]);

  // Don't render (or redirect) until we know the real auth state.
  if (!hydrated || !isAuthenticated) return null;

  return <DashboardLayout>{children}</DashboardLayout>;
}
