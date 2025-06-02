'use client';

import React, { FC, ReactNode } from 'react';
import dynamic from 'next/dynamic';

interface ClientWalletProviderProps {
  children: ReactNode;
}

// Dynamic import to avoid SSR issues
const WalletProviderWithNoSSR = dynamic(
  () => import('./WalletProviderInner'),
  {
    ssr: false,
    loading: () => <div>Loading wallet...</div>
  }
);

const ClientWalletProvider: FC<ClientWalletProviderProps> = ({ children }) => {
  return (
    <WalletProviderWithNoSSR>
      {children}
    </WalletProviderWithNoSSR>
  );
};

export default ClientWalletProvider; 