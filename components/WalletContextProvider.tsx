'use client';

import { ReactNode } from 'react';

interface WalletContextProviderProps {
  children: ReactNode;
}

// Simplified wallet provider for build compatibility
const WalletContextProvider = ({ children }: WalletContextProviderProps) => {
  // For now, just render children without wallet functionality during build
  // This can be enhanced once deployment is working
  return <>{children}</>;
};

export default WalletContextProvider; 