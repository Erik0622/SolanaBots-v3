'use client';

import React, { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

interface WalletProviderInnerProps {
  children: ReactNode;
}

const WalletProviderInner: FC<WalletProviderInnerProps> = ({ children }) => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Mainnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [
            // Only include Phantom for now to avoid compatibility issues
            new PhantomWalletAdapter(),
        ],
        []
    );

    return React.createElement(ConnectionProvider, { endpoint }, 
        React.createElement(WalletProvider, { wallets, autoConnect: true },
            React.createElement(WalletModalProvider, null, children)
        )
    );
};

export default WalletProviderInner; 