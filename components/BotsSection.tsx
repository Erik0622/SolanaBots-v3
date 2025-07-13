'use client';

import React, { FC, useState, useEffect } from 'react';
import BotCard from './BotCard';
import Link from 'next/link';
import { useWallet } from './ClientWalletProvider';
import { getBotStatus, setBotStatus, getAllBotStatus, getBotRisk } from '@/lib/botState';
import { Activity, TrendingUp, ArrowRight, Zap, BarChart3 } from 'lucide-react';

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
      riskLevel: 'medium' as const,
      riskColor: 'text-yellow-400',
      baseRiskPerTrade: volumeTrackerRisk,
      riskManagement: 'Automatic stop-loss mechanisms with 35% loss limitation. Risk per trade adjustable from 1-50% of capital.',
      status: (botStatuses.get('volume-tracker')?.isActive ? 'active' : 'inactive') as 'active' | 'inactive',
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
      status: (botStatuses.get('trend-surfer')?.isActive ? 'active' : 'inactive') as 'active' | 'inactive',
      profitToday: 187.90,
      profitWeek: 432.10,
      profitMonth: 2156.80
    },
    {
      id: 'dip-hunter',
      name: 'Dip Hunter',
      description: 'Strategically buys market dips using technical analysis and automated profit-taking mechanisms.',
      weeklyReturn: '+19.7%',
      monthlyReturn: '+87.4%',
      trades: 156,
      winRate: '69%',
      strategy: 'Detects oversold conditions using RSI and support levels. Enters positions during market downturns with automatic recovery-based exits.',
      riskLevel: 'low' as const,
      riskColor: 'text-green-400',
      baseRiskPerTrade: dipHunterRisk,
      riskManagement: 'Conservative approach with 25% stop-loss and gradual position building. Risk per trade adjustable from 1-50% of capital.',
      status: (botStatuses.get('dip-hunter')?.isActive ? 'active' : 'inactive') as 'active' | 'inactive',
      profitToday: 89.20,
      profitWeek: 267.40,
      profitMonth: 1124.70
    }
  ];

  return (
    <section id="bots" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto max-w-7xl">
        
        {/* Enhanced Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-primary/10 border border-primary/20 rounded-full text-sm sm:text-base text-primary mb-6 sm:mb-8 backdrop-blur-sm hover:scale-105 transition-all duration-300">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full animate-pulse"></div>
            <span className="font-semibold">Trading Bots</span>
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          
          {/* Main Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black mb-4 sm:mb-6 leading-tight">
            <span className="block text-white mb-2">Our Premium</span>
            <span className="block bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient-x">
              Trading Bots
            </span>
          </h2>
          
          {/* Description */}
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Choose from our selection of high-performance trading bots, each with a unique strategy and risk profile.
            All performance data is based on <span className="text-primary font-semibold">proven algorithms</span> with optimized market execution.
          </p>
        </div>

        {/* Live Performance Status - Better positioned */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl sm:rounded-2xl backdrop-blur-sm hover:scale-105 transition-all duration-300">
            <div className="relative">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <span className="text-green-400 font-semibold text-sm sm:text-base">Live Performance Data</span>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
          </div>
        </div>
        
        {/* Enhanced Bot Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 lg:mb-20">
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
                isActive={bot.status === 'active'}
                onToggle={() => handleStatusChange(bot.id, bot.status === 'active' ? 'paused' : 'active')}
                riskPercentage={bot.baseRiskPerTrade}
                onRiskChange={(value) => {
                  if (bot.id === 'volume-tracker') setVolumeTrackerRisk(value);
                  else if (bot.id === 'trend-surfer') setMomentumBotRisk(value);
                  else if (bot.id === 'dip-hunter') setDipHunterRisk(value);
                }}
                riskManagement={`Current risk per trade: ${bot.baseRiskPerTrade}% of your capital (Adjustable via risk slider)`}
                onStatusChange={handleStatusChange}
              />
            </div>
          ))}
        </div>

        {/* Enhanced CTA Section */}
        <div className="relative overflow-hidden">
          
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 blur-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] rounded-3xl"></div>
          
          {/* Content */}
          <div className="relative bg-gradient-to-br from-gray-800/50 via-gray-700/30 to-gray-800/50 backdrop-blur-xl border border-gray-600/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-center">
            
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl sm:rounded-3xl border border-primary/30 mb-6 sm:mb-8 mx-auto">
              <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>
            
            {/* Heading */}
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Ready to Start Trading?
            </h3>
            
            {/* Description */}
            <p className="text-gray-300 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed">
              Connect your wallet and activate your first trading bot in under 2 minutes. 
              All bots include risk management, profit taking, and real-time monitoring.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              
              {/* Primary CTA */}
              {connected ? (
                <Link 
                  href="/dashboard" 
                  className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary to-secondary text-black font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/40 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
                </Link>
              ) : (
                <button className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary to-secondary text-black font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/40 overflow-hidden">
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <span>Connect Wallet</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  
                  {/* Glow effect */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10"></div>
                </button>
              )}
              
              {/* Secondary CTA */}
              <Link 
                href="/launchpad" 
                className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600/50 hover:border-gray-500 text-gray-300 hover:text-white font-semibold text-base sm:text-lg rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 backdrop-blur-sm"
              >
                <span className="flex items-center justify-center gap-3">
                  <span>Create Custom Bot</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
            
            {/* Features List */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12 text-sm sm:text-base">
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Automated Trading</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Risk Management</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-400">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span>24/7 Monitoring</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeIn 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in-up.delay-200 {
          animation-delay: 0.2s;
        }

        .animate-fade-in-up.delay-400 {
          animation-delay: 0.4s;
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }

        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </section>
  );
};

export default BotsSection; 