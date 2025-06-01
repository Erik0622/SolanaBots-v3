'use client';

import React, { ReactNode } from 'react';

interface ClientWalletProviderProps {
  children: ReactNode;
}

// Simplified wallet provider for build compatibility
const ClientWalletProvider = ({ children }: ClientWalletProviderProps) => {
  // For now, just render children without wallet functionality during build
  // This can be enhanced once deployment is working
  return <>{children}</>;
};

export default ClientWalletProvider; 