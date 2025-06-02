'use client';

import React, { FC } from 'react';

interface BotCardProps {
  id: string;
  name: string;
  description: string;
  weeklyReturn: string;
  monthlyReturn: string;
  trades: number;
  winRate: string;
  strategy?: string;
  riskLevel?: 'low' | 'moderate' | 'high' | 'custom';
  riskColor?: string;
  riskManagement?: string;
  baseRiskPerTrade?: number;
  onRiskChange?: (value: number) => void;
  status?: 'active' | 'paused';
  profitToday?: number;
  profitWeek?: number;
  profitMonth?: number;
  onStatusChange?: (id: string, status: 'active' | 'paused') => void;
  showFavoriteButton?: boolean;
}

const BotCard: FC<BotCardProps> = ({
  name,
  description,
  weeklyReturn,
  monthlyReturn,
  trades,
  winRate,
  status = 'paused',
  riskLevel = 'moderate'
}) => {
  return (
    <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/30 rounded-2xl p-6 transition-all duration-500 hover:scale-[1.02] hover:bg-white/10 flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors duration-300 mb-2">
            {name}
          </h3>
          <p className="text-white/70 text-sm leading-relaxed">{description}</p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            status === 'active' 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-gray-500/20 text-gray-400'
          }`}>
            {status === 'active' ? 'Active' : 'Paused'}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium text-yellow-400">
            {riskLevel}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-white/60 text-xs mb-1">Weekly Return</p>
          <p className="text-green-400 font-bold text-base">{weeklyReturn}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-white/60 text-xs mb-1">Monthly Return</p>
          <p className="text-green-400 font-bold text-base">{monthlyReturn}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-white/60 text-xs mb-1">Total Trades</p>
          <p className="text-white font-bold text-base">{trades}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-white/60 text-xs mb-1">Win Rate</p>
          <p className="text-white font-bold text-base">{winRate}</p>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-auto">
        <button className="w-full py-3 px-4 bg-gradient-to-r from-primary to-secondary text-black font-bold text-sm rounded-xl transition-all duration-300 hover:scale-105">
          Connect Wallet to Start
        </button>
      </div>
    </div>
  );
};

export default BotCard;