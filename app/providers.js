'use client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {children}
        <Toaster position="top-right" richColors closeButton duration={4000} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
