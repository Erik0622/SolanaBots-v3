'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useCustomBots } from '@/hooks/useCustomBots';
import { predefinedBots } from '@/config/bots';
import { getBotStatus, getAllBotStatus } from '@/lib/botState';
import Header from '@/components/Header';

// Typdefinitionen
interface Position {
  id: string;
  botType: string;
  entryDate: string;
  entryPrice: number;
  currentPrice: number;
  size: number;
  profit: number;
  profitPercentage: number;
}

const Dashboard = () => {
  const wallet = useWallet();
  const connectionHook = useConnection();
  const { customBots } = useCustomBots();
  const [activeTab, setActiveTab] = useState<'positions' | 'performance' | 'bots'>('bots');
  const [positions, setPositions] = useState<Position[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [totalProfit, setTotalProfit] = useState({ today: 0, week: 0, month: 0, all: 0 });
  const [botStatuses, setBotStatuses] = useState(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Stelle sicher, dass wir auf dem Client sind
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      setBotStatuses(getAllBotStatus());
    }
  }, []);

  // Lade Wallet Balance nur auf dem Client
  useEffect(() => {
    if (!isClient || !wallet.connected || !wallet.publicKey || !connectionHook.connection) {
      return;
    }

    const fetchBalance = async () => {
      try {
        const balanceLamports = await connectionHook.connection.getBalance(wallet.publicKey!);
        const balanceSol = balanceLamports / LAMPORTS_PER_SOL;
        setWalletBalance(balanceSol);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setWalletBalance(0);
      }
    };

    fetchBalance();
    const balanceIntervalId = setInterval(fetchBalance, 10000);
    return () => clearInterval(balanceIntervalId);
  }, [isClient, wallet.connected, wallet.publicKey, connectionHook.connection]);

  // Kombiniere vordefinierte und benutzerdefinierte Bots nur auf dem Client
  const allBots = isClient ? [...predefinedBots, ...customBots].map(bot => ({
    ...bot,
    status: getBotStatus(bot.id) || 'paused',
    // Setze alle Profit-Werte auf 0
    profitToday: 0,
    profitWeek: 0,
    profitMonth: 0
  })) : [];

  // Zeige Loading während der Hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-dark-light">
        <Header />
        <div className="py-20 px-6 min-h-[60vh] mt-16">
          <div className="container mx-auto">
            <div className="flex items-center justify-center">
              <div className="loading-spinner"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-light">
      <Header />
      <div className="py-20 px-6 min-h-[60vh] mt-16">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-6">Portfolio Overview</h3>
                
                {/* Wallet Balance */}
                <div className="mb-6">
                  <p className="text-white/60 text-sm">Wallet Balance</p>
                  <p className="text-2xl font-bold">{walletBalance.toFixed(4)} SOL</p>
                </div>

                {/* Total Profit */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/60">Today</span>
                    <span className={totalProfit.today >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {totalProfit.today >= 0 ? '+' : ''}{totalProfit.today.toFixed(2)} SOL
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">This Week</span>
                    <span className={totalProfit.week >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {totalProfit.week >= 0 ? '+' : ''}{totalProfit.week.toFixed(2)} SOL
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">This Month</span>
                    <span className={totalProfit.month >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {totalProfit.month >= 0 ? '+' : ''}{totalProfit.month.toFixed(2)} SOL
                    </span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-white/10 pt-3">
                    <span>All Time</span>
                    <span className={totalProfit.all >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {totalProfit.all >= 0 ? '+' : ''}{totalProfit.all.toFixed(2)} SOL
                    </span>
                  </div>
                </div>

                {/* Wallet Connect */}
                {!wallet.connected && (
                  <div className="mt-6">
                    <WalletMultiButton className="!w-full !justify-center !bg-gradient-to-r !from-primary !to-secondary !text-black !font-bold !rounded-xl" />
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              {/* Tabs */}
              <div className="flex gap-4 mb-6">
                {(['bots', 'positions', 'performance'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      activeTab === tab
                        ? 'bg-gradient-to-r from-primary to-secondary text-black'
                        : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Content */}
              {activeTab === 'bots' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {allBots.map((bot) => (
                    <div key={bot.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold">{bot.name}</h3>
                          <p className="text-white/60 text-sm">{bot.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          bot.status === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {bot.status === 'active' ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-white/60">Weekly Return</p>
                          <p className="font-semibold text-green-400">{bot.weeklyReturn}</p>
                        </div>
                        <div>
                          <p className="text-white/60">Monthly Return</p>
                          <p className="font-semibold text-green-400">{bot.monthlyReturn}</p>
                        </div>
                        <div>
                          <p className="text-white/60">Trades</p>
                          <p className="font-semibold">{bot.trades}</p>
                        </div>
                        <div>
                          <p className="text-white/60">Win Rate</p>
                          <p className="font-semibold">{bot.winRate}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'positions' && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-bold mb-6">Open Positions</h3>
                  {positions.length === 0 ? (
                    <p className="text-white/60 text-center py-8">No open positions yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {positions.map((position) => (
                        <div key={position.id} className="bg-white/5 rounded-xl p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold">{position.botType}</h4>
                              <p className="text-white/60 text-sm">{position.entryDate}</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${position.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {position.profit >= 0 ? '+' : ''}{position.profit.toFixed(4)} SOL
                              </p>
                              <p className={`text-sm ${position.profitPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {position.profitPercentage >= 0 ? '+' : ''}{position.profitPercentage.toFixed(2)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                  <h3 className="text-xl font-bold mb-6">Performance Analytics</h3>
                  <p className="text-white/60 text-center py-8">Performance charts coming soon...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 