'use client';

import React, { FC, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ResponsiveContainer, Tooltip, YAxis, XAxis, Area, AreaChart } from 'recharts';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { getBotStatus, setBotStatus, isBotActive, saveBotRisk, getBotRisk } from '@/lib/botState';
import { useFavoriteBots } from '@/hooks/useFavoriteBots';
import { useSimulation } from '@/hooks/useSimulation';

interface BotCardProps {
  id: string;
  name: string;
  description: string;
  weeklyReturn: string;
  monthlyReturn: string;
  trades: number;
  winRate: string;
  strategy: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'custom';
  riskColor?: string;
  riskManagement?: string;
  baseRiskPerTrade: number;
  onRiskChange?: (value: number) => void;
  status?: 'active' | 'paused';
  profitToday?: number;
  profitWeek?: number;
  profitMonth?: number;
  onStatusChange?: (id: string, status: 'active' | 'paused') => void;
  showFavoriteButton?: boolean;
}

const BotCard: FC<BotCardProps> = ({
  id,
  name,
  description,
  weeklyReturn,
  monthlyReturn,
  trades,
  winRate,
  strategy,
  riskLevel,
  riskColor,
  riskManagement,
  baseRiskPerTrade,
  onRiskChange,
  status = 'paused',
  profitToday = 0,
  profitWeek = 0,
  profitMonth = 0,
  onStatusChange = () => {},
  showFavoriteButton = false
}) => {
  const wallet = useWallet();
  const { isBotFavorite, toggleFavorite } = useFavoriteBots();
  const [performanceTimeframe, setPerformanceTimeframe] = useState<'7d' | '30d'>('7d');
  const [riskPercentage, setRiskPercentage] = useState(5); // Default value
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [botStatus, setBotStatusState] = useState<'active' | 'paused'>('paused');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [enableRealAPI, setEnableRealAPI] = useState(true);
  const [isClient, setIsClient] = useState(false);
  
  // Load simulation data for this bot
  const { 
    simulation, 
    error: simulationError, 
    dataSource,
    toggleDataSource,
    refreshSimulation
  } = useSimulation(id, false, enableRealAPI);

  // Client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Animation on mount
  useEffect(() => {
    if (!isClient) return;
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [isClient]);

  // Initialize client-side only values
  useEffect(() => {
    if (!isClient) return;
    
    // Load risk percentage from localStorage
    const savedRisk = getBotRisk(id);
    setRiskPercentage(savedRisk);
    
    // Load bot status from localStorage
    const status = getBotStatus(id);
    setBotStatusState(status?.isActive ? 'active' : 'paused');
  }, [id, isClient]);

  // Check if bot is favorite (client-side only)
  useEffect(() => {
    if (!isClient || !wallet.publicKey) return;
    setIsFavorite(isBotFavorite(id));
  }, [id, wallet.publicKey, isBotFavorite, isClient]);
  
  // Bot status polling (client-side only)
  useEffect(() => {
    if (!isClient || !wallet.connected || !wallet.publicKey) return;
    
    let statusInterval: NodeJS.Timeout | undefined;

    const fetchBotStatus = async () => {
      try {
        const localStatus = getBotStatus(id);
        const timestamp = Date.now();
        const response = await fetch(`/api/bots/status?botId=${id}&_=${timestamp}`, {
          headers: {
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          },
          cache: 'no-store',
          next: { revalidate: 0 }
        });
        
        if (!response.ok) {
          console.warn(`Could not fetch bot status for ${id}: ${response.status}`);
          return;
        }
        
        const data = await response.json();
        const apiStatus = data.status as 'active' | 'paused';
        
        const localBotStatus = getBotStatus(id);
        if (!localBotStatus || localBotStatus.isActive !== (apiStatus === 'active')) {
          setBotStatusState(apiStatus);
        }
      } catch (error) {
        console.error('Error fetching bot status:', error);
      }
    };

    fetchBotStatus();
    statusInterval = setInterval(fetchBotStatus, 10000);
    
    return () => {
      if (statusInterval) {
        clearInterval(statusInterval);
      }
    };
  }, [wallet.connected, wallet.publicKey, id, isClient]);

  const getBotTypeFromName = (name: string) => {
    const nameToType: Record<string, string> = {
      'Volume Tracker': 'volume-tracker',
      'Trend Surfer': 'trend-surfer', 
      'Dip Hunter': 'dip-hunter',
      'Lightning Scalper': 'scalper',
      'Smart Yield': 'yield',
      'Arbitrage Finder': 'arbitrage'
    };
    return nameToType[name] || name.toLowerCase().replace(/\s+/g, '-');
  };

  const updateRiskPercentage = (newRisk: number) => {
    if (!isClient) return;
    
    setRiskPercentage(newRisk);
    saveBotRisk(id, newRisk);
    if (onRiskChange) {
      onRiskChange(newRisk);
    }
  };

  const activateBot = async () => {
    if (!isClient || !wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
      setError('Please connect your wallet first');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/bot/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botId: id,
          walletAddress: wallet.publicKey.toString(),
          riskPercentage: riskPercentage,
          action: botStatus === 'active' ? 'deactivate' : 'activate',
          botType: getBotTypeFromName(name)
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to prepare bot activation/deactivation' }));
        throw new Error(errorData.error || 'Failed to prepare bot activation/deactivation');
      }
      const { transaction: serializedTransaction } = await response.json();
      const transaction = Transaction.from(Buffer.from(serializedTransaction, 'base64'));
      const signedTransaction = await wallet.signTransaction(transaction);
      const confirmResponse = await fetch('/api/bot/confirm-activation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botId: id,
          signedTransaction: signedTransaction.serialize().toString('base64'),
          action: botStatus === 'active' ? 'deactivate' : 'activate'
        }),
      });
      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json().catch(() => ({ error: 'Failed to confirm bot activation/deactivation' }));
        throw new Error(errorData.error || 'Failed to confirm bot activation/deactivation');
      }
      const confirmationResult = await confirmResponse.json();
      
      if (confirmationResult.success) {
        const newStatus = botStatus === 'active' ? 'paused' : 'active';
        setBotStatusState(newStatus);
        setBotStatus(id, { isActive: newStatus === 'active' });
        onStatusChange(id, newStatus);
      }
    } catch (error) {
      console.error('Error toggling bot status:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteToggle = () => {
    if (!isClient) return;
    toggleFavorite(id);
    setIsFavorite(!isFavorite);
  };

  // Sample data for performance chart
  const performanceData = simulation?.data || [
    { time: '00:00', value: 100 },
    { time: '04:00', value: 102 },
    { time: '08:00', value: 98 },
    { time: '12:00', value: 105 },
    { time: '16:00', value: 103 },
    { time: '20:00', value: 107 },
    { time: '24:00', value: 110 }
  ];

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 h-96">
        <div className="flex items-center justify-center h-full">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`group relative bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/30 rounded-2xl p-4 sm:p-6 transition-all duration-500 hover:scale-[1.02] hover:bg-white/10 flex flex-col h-full ${
        isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-4'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-primary transition-colors duration-300">
              {name}
            </h3>
            {showFavoriteButton && (
              <button
                onClick={handleFavoriteToggle}
                className={`text-lg transition-all duration-300 hover:scale-110 ${
                  isFavorite ? 'text-yellow-400' : 'text-white/40 hover:text-yellow-400'
                }`}
              >
                ⭐
              </button>
            )}
          </div>
          <p className="text-white/70 text-xs sm:text-sm leading-relaxed">{description}</p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
            botStatus === 'active' 
              ? 'bg-green-500/20 text-green-400 animate-pulse' 
              : 'bg-gray-500/20 text-gray-400'
          }`}>
            {botStatus === 'active' ? 'Active' : 'Paused'}
          </span>
          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${riskColor}`}>
            {riskLevel === 'custom' ? `${riskPercentage}%` : riskLevel}
          </span>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="mb-4 h-32 sm:h-40">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/60 text-xs sm:text-sm">Performance ({performanceTimeframe})</span>
          <div className="flex gap-1">
            <button
              onClick={() => setPerformanceTimeframe('7d')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                performanceTimeframe === '7d' 
                  ? 'bg-primary text-black' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setPerformanceTimeframe('30d')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                performanceTimeframe === '30d' 
                  ? 'bg-primary text-black' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              30D
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={performanceData}>
            <defs>
              <linearGradient id={`gradient-${id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9945FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#9945FF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="#9945FF"
              strokeWidth={2}
              fill={`url(#gradient-${id})`}
            />
            <XAxis dataKey="time" hide />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                border: 'none', 
                borderRadius: '8px',
                backdropFilter: 'blur(10px)'
              }}
              labelStyle={{ color: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-white/60 text-xs mb-1">Weekly Return</p>
          <p className="text-green-400 font-bold text-sm sm:text-base">{weeklyReturn}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-white/60 text-xs mb-1">Monthly Return</p>
          <p className="text-green-400 font-bold text-sm sm:text-base">{monthlyReturn}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-white/60 text-xs mb-1">Total Trades</p>
          <p className="text-white font-bold text-sm sm:text-base">{trades}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-white/60 text-xs mb-1">Win Rate</p>
          <p className="text-white font-bold text-sm sm:text-base">{winRate}</p>
        </div>
      </div>

      {/* Risk Management */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/60 text-xs sm:text-sm">Risk per Trade</span>
          <span className="text-white font-medium text-xs sm:text-sm">{riskPercentage}%</span>
        </div>
        <input
          type="range"
          min="1"
          max="50"
          value={riskPercentage}
          onChange={(e) => updateRiskPercentage(parseInt(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #9945FF 0%, #9945FF ${riskPercentage * 2}%, rgba(255,255,255,0.1) ${riskPercentage * 2}%, rgba(255,255,255,0.1) 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-white/40 mt-1">
          <span>1%</span>
          <span>25%</span>
          <span>50%</span>
        </div>
      </div>

      {/* Strategy Info */}
      <div className="mb-4 p-3 bg-white/5 rounded-xl">
        <p className="text-white/60 text-xs mb-1">Strategy</p>
        <p className="text-white text-xs sm:text-sm">{strategy}</p>
      </div>

      {/* Action Buttons */}
      <div className="mt-auto">
        {wallet.connected ? (
          <div className="flex gap-2 sm:gap-3">
            <button 
              className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 ${
                isLoading 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : botStatus === 'active' 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:scale-105 hover:shadow-lg hover:shadow-yellow-400/25' 
                    : 'bg-gradient-to-r from-primary to-secondary text-black hover:scale-105 hover:shadow-lg hover:shadow-primary/25'
              }`}
              onClick={activateBot}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="loading-spinner"></div>
                  Processing...
                </span>
              ) : (
                botStatus === 'active' ? 'Pause Bot' : 'Start Bot'
              )}
            </button>
            <button className="px-3 sm:px-4 py-2 sm:py-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-primary/50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all duration-300 hover:scale-105">
              ⚙️
            </button>
          </div>
        ) : (
          <WalletMultiButton className="!w-full !py-2 sm:!py-3 !justify-center !bg-gradient-to-r !from-primary !to-secondary !text-black !font-bold !rounded-xl !transition-all !duration-300 hover:!scale-105 !text-xs sm:!text-sm" />
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs sm:text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default BotCard;