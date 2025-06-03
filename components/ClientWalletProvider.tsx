'use client';

import React, { FC, ReactNode, createContext, useContext } from 'react';

interface ClientWalletProviderProps {
  children: ReactNode;
}

// Temporary mock wallet context that provides the basic functionality
const WalletContext = createContext({
  connected: false,
  publicKey: null,
  signTransaction: null,
  connect: async () => {},
  disconnect: async () => {},
});

// Export the hook for components to use
export const useWallet = () => useContext(WalletContext);

// Mock WalletMultiButton component
export const WalletMultiButton = ({ className }: { className?: string }) => (
  <button 
    className={className || "bg-gradient-to-r from-green-400 to-blue-500 text-black font-bold text-lg px-8 py-4 rounded-xl"}
    onClick={() => {
      console.log('Wallet connection would happen here...');
      // In a real implementation, this would open the wallet connection modal
    }}
  >
    Connect Wallet
  </button>
);

const ClientWalletProvider: FC<ClientWalletProviderProps> = ({ children }) => {
  const mockWalletValue = {
    connected: false,
    publicKey: null,
    signTransaction: null,
    connect: async () => {
      console.log('Mock wallet connect');
    },
    disconnect: async () => {
      console.log('Mock wallet disconnect');
    },
  };

  return (
    <WalletContext.Provider value={mockWalletValue}>
      {children}
    </WalletContext.Provider>
  );
};

export default ClientWalletProvider; 