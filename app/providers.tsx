'use client';

import React from 'react';
import ClientWalletProvider from '@/components/ClientWalletProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return <ClientWalletProvider>{children}</ClientWalletProvider>;
} 