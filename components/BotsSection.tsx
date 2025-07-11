'use client';

import React, { FC, useState, useEffect } from 'react';
import BotCard from './BotCard';
import Link from 'next/link';
import { useWallet } from './ClientWalletProvider';
import { getBotStatus, setBotStatus, getAllBotStatus, getBotRisk } from '@/lib/botState';

const BotsSection: FC = () => {
  // Individual risk settings for each bot (1-50%)
  const [volumeTrackerRisk, setVolumeTrackerRisk] = useState(getBotRisk('volume-tracker'));
  const [momentumBotRisk, setMomentumBotRisk] = useState(getBotRisk('trend-surfer'));
  const [dipHunterRisk, setDipHunterRisk] = useState(getBotRisk('dip-hunter'));
  
  // Bot status from localStorage
  const [botStatuses, setBotStatuses] = useState(getAllBotStatus());
  
  const { connected } = useWallet();

  // Update status from localStorage regularly
  useEffect(() => {
    setBotStatuses(getAllBotStatus());
    setVolumeTrackerRisk(getBotRisk('volume-tracker'));
    setMomentumBotRisk(getBotRisk('trend-surfer'));
    setDipHunterRisk(getBotRisk('dip-hunter'));
    
    const statusInterval = setInterval(() => {
      const freshStatuses = getAllBotStatus();
      setBotStatuses(freshStatuses);
      setVolumeTrackerRisk(getBotRisk('volume-tracker'));
      setMomentumBotRisk(getBotRisk('trend-surfer'));
      setDipHunterRisk(getBotRisk('dip-hunter'));
    }, 2000);
    
    return () => clearInterval(statusInterval);
  }, []);
  
  // Handle bot status change
  const handleStatusChange = (id: string, status: 'active' | 'paused') => {
    setBotStatus(id, { isActive: status === 'active' });
    setBotStatuses(getAllBotStatus());
  };

  // Mock performance data for demonstration
  const bots = [
    {
      id: 'volume-tracker',
      name: 'Volume Tracker',
      description: 'Detects sudden volume spikes in newly listed tokens (<24h) and trades automatically at specific volume thresholds.',
      weeklyReturn: '+28.3%',
      monthlyReturn: '+156.7%',
      trades: 247,
      winRate: '73%',
      strategy: 'Buys at specific volume-to-market-cap thresholds in freshly listed tokens (under 24h). Sells with staged profit-taking at 70% and full exit at 140% profit, with stop-loss at 35%.',
      riskLevel: 'moderate' as const,
      riskColor: 'text-yellow-400',
      baseRiskPerTrade: volumeTrackerRisk,
      riskManagement: 'Automatic stop-loss mechanisms with 35% loss limitation. Risk per trade adjustable from 1-50% of capital.',
      status: (botStatuses.get('volume-tracker')?.isActive ? 'active' : 'paused') as 'active' | 'paused',
      profitToday: 142.50,
      profitWeek: 356.80,
      profitMonth: 1847.30
    },
    {
      id: 'trend-surfer',
      name: 'Momentum Bot',
      description: 'Identifies explosive price movements in new tokens by detecting consecutive green candles with increasing volume.',
      weeklyReturn: '+34.8%',
      monthlyReturn: '+189.2%',
      trades: 189,
      winRate: '81%',
      strategy: 'Identifies strong momentum signals with at least 3 consecutive green candles and 15%+ price increase in 15 minutes. Uses staged profit-taking at 60%, 100%, and 140%.',
      riskLevel: 'high' as const,
      riskColor: 'text-red-400',
      baseRiskPerTrade: momentumBotRisk,
      riskManagement: 'Higher base volatility with stop-loss at 35%. Risk per trade adjustable from 1-50% of capital.',
      status: (botStatuses.get('trend-surfer')?.isActive ? 'active' : 'paused') as 'active' | 'paused',
      profitToday: 187.90,
      profitWeek: 432.10,
      profitMonth: 2156.80
    },
    {
      id: 'dip-hunter',
      name: 'Dip Hunter',
      description: 'Identifies significant price drops (30-60%) in new but stable tokens and leverages high-potential entry opportunities.',
      weeklyReturn: '+19.7%',
      monthlyReturn: '+97.4%',
      trades: 156,
      winRate: '68%',
      strategy: 'Identifies optimal dip-buying opportunities during 30-60% price drops from all-time highs. Implements 50% partial profit-taking at 60% and full exit at 100%.',
      riskLevel: 'low' as const,
      riskColor: 'text-green-400',
      baseRiskPerTrade: dipHunterRisk,
      riskManagement: 'Lowest base volatility with 25% stop-loss. Maximum holding time of 60 minutes for reduced risk.',
      status: (botStatuses.get('dip-hunter')?.isActive ? 'active' : 'paused') as 'active' | 'paused',
      profitToday: 89.40,
      profitWeek: 267.50,
      profitMonth: 1123.70
    },
  ];

  return (
    <section id="bots" className="py-20 px-6 bg-dark-light">
      <div className="container mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary mb-8 backdrop-blur-sm hover:scale-105 transition-all duration-300">
            <span className="w-3 h-3 bg-primary rounded-full animate-pulse"></span>
            <span className="font-semibold">Trading Bots</span>
            <span className="text-xl">🤖</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 leading-tight">
            <span className="block text-white mb-2">Our Premium</span>
            <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient-x">
              Trading Bots
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-white/80 max-w-4xl mx-auto leading-relaxed">
            Choose from our selection of high-performance trading bots, each with a unique strategy and risk profile.
            All performance data is based on <span className="text-primary font-semibold">proven algorithms</span> with optimized market execution.
          </p>
        </div>

        {/* Performance Status */}
        <div className="flex justify-center mb-12">
          <div className="px-8 py-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl text-white font-medium backdrop-blur-sm">
            <span className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-semibold">Live Performance Data</span>
              <span className="text-2xl">📊</span>
            </span>
          </div>
        </div>
        
        {/* Enhanced Bot Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {bots.map((bot, index) => (
            <div 
              key={bot.id} 
              className={`transform transition-all duration-700 ${
                index === 0 ? 'animate-fade-in-up' : 
                index === 1 ? 'animate-fade-in-up delay-200' : 
                'animate-fade-in-up delay-400'
              }`}
            >
              <BotCard 
                {...bot}
                onRiskChange={(value) => {
                  if (bot.id === 'volume-tracker') setVolumeTrackerRisk(value);
                  else if (bot.id === 'trend-surfer') setMomentumBotRisk(value);
                  else if (bot.id === 'dip-hunter') setDipHunterRisk(value);
                }}
                riskManagement={`Current risk per trade: ${bot.baseRiskPerTrade}% of your capital (Adjustable via risk slider)`}
                onStatusChange={handleStatusChange}
                showFavoriteButton={connected}
              />
            </div>
          ))}
        </div>

        {/* Enhanced CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-br from-white/[0.08] via-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-2xl mx-auto">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                <span className="text-3xl">🚀</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Ready to Start Trading?
              </h3>
              <p className="text-white/70">
                Connect your wallet and activate your first trading bot in minutes.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {connected ? (
                <Link 
                  href="/dashboard" 
                  className="group px-8 py-4 bg-gradient-to-r from-primary to-secondary text-black font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg overflow-hidden"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-xl">📊</span>
                    Go to Dashboard
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </Link>
              ) : (
                <button className="group px-8 py-4 bg-gradient-to-r from-primary to-secondary text-black font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg overflow-hidden">
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-xl">🔗</span>
                    Connect Wallet
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </button>
              )}
              
              <Link 
                href="/launchpad" 
                className="group px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 hover:border-primary/50 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="text-xl">⚡</span>
                  Create Custom Bot
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BotsSection; 