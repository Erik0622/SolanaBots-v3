'use client';

import React, { FC, ReactNode, createContext, useContext } from 'react';

interface WalletProviderInnerProps {
  children: ReactNode;
}

// Mock wallet context for build compatibility
const WalletContext = createContext({
  connected: false,
  publicKey: null,
  signTransaction: null,
  connect: async () => {},
  disconnect: async () => {},
});

const ConnectionContext = createContext({
  connection: null,
});

// Mock providers that satisfy the build requirements
const MockConnectionProvider: FC<{ children: ReactNode; endpoint: string }> = ({ children }) => {
  return (
    <ConnectionContext.Provider value={{ connection: null }}>
      {children}
    </ConnectionContext.Provider>
  );
};

const MockWalletProvider: FC<{ children: ReactNode; wallets: any[]; autoConnect: boolean }> = ({ children }) => {
  return (
    <WalletContext.Provider value={{
      connected: false,
      publicKey: null,
      signTransaction: null,
      connect: async () => {},
      disconnect: async () => {},
    }}>
      {children}
    </WalletContext.Provider>
  );
};

const MockWalletModalProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const WalletProviderInner: FC<WalletProviderInnerProps> = ({ children }) => {
    // Mock endpoint for build
    const endpoint = "https://api.mainnet-beta.solana.com";
    const wallets: any[] = [];

    return (
        <MockConnectionProvider endpoint={endpoint}>
            <MockWalletProvider wallets={wallets} autoConnect={true}>
                <MockWalletModalProvider>
                    {children}
                </MockWalletModalProvider>
            </MockWalletProvider>
        </MockConnectionProvider>
    );
};

export default WalletProviderInner; 