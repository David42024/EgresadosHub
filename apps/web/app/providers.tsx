'use client';

import { ThemeProvider } from 'next-themes';
import { TrpcProvider } from '@/lib/trpc/provider';
import { Toaster } from '@/components/ui/toaster';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <TrpcProvider>
        {children}
        <Toaster />
      </TrpcProvider>
    </ThemeProvider>
  );
}
