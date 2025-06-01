'use client';

import React, { FC, useState, useEffect } from 'react';
import BotCard from './BotCard';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { getBotStatus, setBotStatus, getAllBotStatus, getBotRisk } from '@/lib/botState';

interface BotsSectionClientContentProps {
  connected: boolean;
}

const BotsSectionClientContent: FC<BotsSectionClientContentProps> = ({ connected }) => {
  const [volumeTrackerRisk, setVolumeTrackerRisk] = useState(5);
  const [momentumBotRisk, setMomentumBotRisk] = useState(5);
  const [dipHunterRisk, setDipHunterRisk] = useState(5);
  const [botStatuses, setBotStatuses] = useState(new Map());

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

  const handleStatusChange = (id: string, status: 'active' | 'paused') => {
    setBotStatus(id, { isActive: status === 'active' });
    setBotStatuses(getAllBotStatus());
  };

  const bots = [
    {
      id: 'volume-tracker',
      name: 'Volume Tracker',
      description: 'A powerful bot that detects sudden volume spikes in newly listed tokens (< 24h) and automatically trades when specific volume thresholds relative to market cap are reached.',
      weeklyReturn: '+50.0%',
      monthlyReturn: '+143.2%',
      trades: 118,
      winRate: '73%',
      strategy: 'Buys when specific volume-to-market-cap thresholds are met in freshly listed tokens (under 24h), avoiding the first 30 minutes after launch. Sells with tiered profit-taking at 70% and full exit at 140% profit, with a stop-loss at 35%.',
      riskLevel: 'moderate' as const,
      riskColor: 'text-yellow-400',
      baseRiskPerTrade: volumeTrackerRisk,
      riskManagement: 'The bot implements automatic stop-loss mechanisms for each trade with 35% loss limitation. Risk per trade can be adjusted from 1-50% of your capital.',
      status: (botStatuses.get('volume-tracker')?.isActive ? 'active' : 'paused') as 'active' | 'paused',
      profitToday: 5.0,
      profitWeek: 50.0,
      profitMonth: 143.2
    },
    {
      id: 'trend-surfer',
      name: 'Momentum Bot',
      description: 'An advanced bot that identifies explosive price movements in new tokens by detecting consecutive green candles with increasing volume.',
      weeklyReturn: '+76.8%',
      monthlyReturn: '+218.8%',
      trades: 84,
      winRate: '65%',
      strategy: 'Identifies strong momentum signals, including at least 3 consecutive green candles and 15%+ price increase in 15 minutes with increasing volume. Only trades tokens within the first 24 hours after launch (after the first 30 minutes) and uses tiered profit-taking at 60%, 100%, and 140%.',
      riskLevel: 'high' as const,
      riskColor: 'text-red-400',
      baseRiskPerTrade: momentumBotRisk,
      riskManagement: 'Due to the more aggressive strategy, this bot has a higher base volatility with a stop-loss at 35%. Risk per trade can be adjusted from 1-50% of your capital.',
      status: (botStatuses.get('trend-surfer')?.isActive ? 'active' : 'paused') as 'active' | 'paused',
      profitToday: 7.6,
      profitWeek: 76.8,
      profitMonth: 218.8
    },
    {
      id: 'dip-hunter',
      name: 'Dip Hunter',
      description: 'An intelligent bot that identifies significant price drops (30-60%) in new but stable tokens and capitalizes on high-potential entry opportunities.',
      weeklyReturn: '+46.8%',
      monthlyReturn: '+134.4%',
      trades: 326,
      winRate: '91%',
      strategy: 'Identifies optimal dip-buying opportunities during 30-60% price retracements from all-time highs, but only in tokens with stable liquidity and sustained trading volume. Exclusively trades within the first 24 hours after launch, avoiding the first 30 minutes. Implements 50% partial profit-taking at 60% gain and full exit at 100%.',
      riskLevel: 'low' as const,
      riskColor: 'text-green-400',
      baseRiskPerTrade: dipHunterRisk,
      riskManagement: 'Lowest base volatility with a stop-loss of 25%. Maximum holding time of 60 minutes for reduced risk. Risk per trade can be adjusted from 1-50% of your capital.',
      status: (botStatuses.get('dip-hunter')?.isActive ? 'active' : 'paused') as 'active' | 'paused',
      profitToday: 4.6,
      profitWeek: 46.8,
      profitMonth: 134.4
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {bots.map((bot) => (
        <BotCard 
          key={bot.id} 
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
      ))}
    </div>
  );
};

const BotsSection: FC = () => {
  const [isClient, setIsClient] = useState(false);
  const wallet = useWallet(); // Call useWallet unconditionally

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
    <section id="bots" className="py-20 px-6 bg-dark-light">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
          Our <span className="text-primary">Trading Bots</span>
        </h2>
        
        <p className="text-center text-white/80 mb-12 max-w-3xl mx-auto">
          Choose from our selection of high-performance trading bots, each with a unique strategy and risk profile.
          All bots come with guaranteed profitability and real-time performance tracking.
        </p>
        
        {isClient ? <BotsSectionClientContent connected={wallet.connected} /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Placeholder for non-client render - could show basic bot info without interactive elements */}
            {[1,2,3].map(i => (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 h-96">
                <div className="flex items-center justify-center h-full">
                  <div className="loading-spinner"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BotsSection; 