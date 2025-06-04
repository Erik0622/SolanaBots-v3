'use client';

import React, { FC, useState, useEffect } from 'react';
import { useFavoriteBots } from '@/hooks/useFavoriteBots';
import { saveBotRisk } from '@/lib/botState';
import Link from 'next/link';
import { useSimulation } from '@/hooks/useSimulation';

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
  id,
  name,
  description,
  weeklyReturn,
  monthlyReturn,
  trades,
  winRate,
  strategy,
  riskLevel = 'moderate',
  riskColor = 'text-yellow-400',
  riskManagement,
  baseRiskPerTrade = 10,
  onRiskChange,
  status = 'paused',
  profitToday = 0,
  profitWeek = 0,
  profitMonth = 0,
  onStatusChange,
  showFavoriteButton = false
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [currentRisk, setCurrentRisk] = useState(baseRiskPerTrade);
  const [isActive, setIsActive] = useState(status === 'active');
  const { isBotFavorite, toggleFavorite } = useFavoriteBots();
  const [isHovered, setIsHovered] = useState(false);

  const { simulation, isLoading: simulationLoading } = useSimulation(id, false, true, true);
  
  const performanceData = simulation.dailyData.length > 0 
    ? simulation.dailyData.slice(-7).map((day, index) => ({
        day: index + 1,
        value: day.value
      }))
    : [];

  useEffect(() => {
    setCurrentRisk(baseRiskPerTrade);
  }, [baseRiskPerTrade]);

  useEffect(() => {
    setIsActive(status === 'active');
  }, [status]);

  const handleRiskChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRisk = parseInt(event.target.value);
    setCurrentRisk(newRisk);
    onRiskChange?.(newRisk);
    saveBotRisk(id, newRisk);
  };

  const handleStatusToggle = () => {
    const newStatus = isActive ? 'paused' : 'active';
    setIsActive(!isActive);
    onStatusChange?.(id, newStatus);
  };

  const getRiskColorClass = (risk: number) => {
    if (risk <= 10) return 'text-green-400';
    if (risk <= 20) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskLevelText = (risk: number) => {
    if (risk <= 10) return 'Low Risk';
    if (risk <= 20) return 'Medium Risk';
    return 'High Risk';
  };

  return (
    <div 
      className="group relative bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/30 rounded-2xl p-6 transition-all duration-500 hover:scale-[1.02] hover:bg-white/10 flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      
      {/* Header */}
      <div className="relative z-10 flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors duration-300">
              {name}
            </h3>
            {showFavoriteButton && (
              <button
                onClick={() => toggleFavorite(id)}
                className={`p-1 rounded-full transition-colors duration-200 ${
                  isBotFavorite(id) 
                    ? 'text-yellow-400 hover:text-yellow-300' 
                    : 'text-white/40 hover:text-yellow-400'
                }`}
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-white/70 text-sm leading-relaxed line-clamp-3">{description}</p>
        </div>
        <div className="flex flex-col items-end gap-2 ml-4">
          <div className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
            isActive 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
          }`}>
            {isActive ? 'Active' : 'Paused'}
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${riskColor} bg-white/5 border border-white/10`}>
            {riskLevel}
          </div>
        </div>
      </div>

      {/* Mini Performance Chart */}
      <div className="relative z-10 mb-4">
        <div className="h-16 bg-white/5 rounded-xl p-2 border border-white/10">
          {simulationLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : performanceData.length > 0 ? (
            <div className="flex items-end justify-between h-full">
              {performanceData.map((point, index) => {
                // Normalisiere Werte für Anzeige (0-100 wird zu 0-15 für Chart-Höhe)
                const normalizedValue = Math.max(0, Math.min(15, (point.value / 100) * 15));
                return (
                  <div
                    key={index}
                    className="bg-gradient-to-t from-primary to-primary/50 rounded-sm transition-all duration-300 hover:from-secondary hover:to-secondary/50"
                    style={{ 
                      height: `${Math.max(5, (normalizedValue / 15) * 100)}%`, // Min 5% Höhe für Sichtbarkeit
                      width: `${100 / performanceData.length - 2}%`
                    }}
                    title={`Tag ${point.day}: ${point.value.toFixed(1)}%`}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-white/40 text-xs">
              Keine Daten verfügbar
            </div>
          )}
        </div>
        {performanceData.length > 0 && (
          <div className="text-xs text-white/40 mt-1 text-center">
            Letzte 7 Tage Performance
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="relative z-10 grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/5 rounded-xl p-3 border border-white/10 hover:border-primary/20 transition-colors duration-300">
          <p className="text-white/60 text-xs mb-1">Weekly</p>
          <p className="text-green-400 font-bold text-sm">{weeklyReturn}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/10 hover:border-primary/20 transition-colors duration-300">
          <p className="text-white/60 text-xs mb-1">Monthly</p>
          <p className="text-green-400 font-bold text-sm">{monthlyReturn}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/10 hover:border-primary/20 transition-colors duration-300">
          <p className="text-white/60 text-xs mb-1">Trades</p>
          <p className="text-white font-bold text-sm">{trades}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/10 hover:border-primary/20 transition-colors duration-300">
          <p className="text-white/60 text-xs mb-1">Win Rate</p>
          <p className="text-white font-bold text-sm">{winRate}</p>
        </div>
      </div>

      {/* Risk Management Slider */}
      <div className="relative z-10 mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/70 text-sm font-medium">Risk per Trade</span>
          <span className={`text-sm font-bold ${getRiskColorClass(currentRisk)}`}>
            {currentRisk}%
          </span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="1"
            max="50"
            value={currentRisk}
            onChange={handleRiskChange}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, #14F195 0%, #14F195 ${(currentRisk / 50) * 100}%, rgba(255,255,255,0.1) ${(currentRisk / 50) * 100}%, rgba(255,255,255,0.1) 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>1%</span>
            <span className={`${getRiskColorClass(currentRisk)} font-medium`}>
              {getRiskLevelText(currentRisk)}
            </span>
            <span>50%</span>
          </div>
        </div>
      </div>

      {/* Profit Display */}
      {(profitToday > 0 || profitWeek > 0 || profitMonth > 0) && (
        <div className="relative z-10 mb-4 p-4 bg-gradient-to-r from-green-500/10 to-green-400/10 rounded-xl border border-green-500/20">
          <h4 className="text-green-400 font-semibold text-sm mb-2">Profits</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-white/60">Today</p>
              <p className="text-green-400 font-bold">+${profitToday.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-white/60">Week</p>
              <p className="text-green-400 font-bold">+${profitWeek.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-white/60">Month</p>
              <p className="text-green-400 font-bold">+${profitMonth.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Expandable Details */}
      {showDetails && (
        <div className="relative z-10 mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
          <h4 className="text-white font-semibold text-sm mb-2">Strategy Details</h4>
          <p className="text-white/70 text-xs leading-relaxed mb-3">{strategy}</p>
          {riskManagement && (
            <>
              <h4 className="text-white font-semibold text-sm mb-2">Risk Management</h4>
              <p className="text-white/70 text-xs leading-relaxed">{riskManagement}</p>
            </>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="relative z-10 mt-auto space-y-3">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-primary/50 text-white text-sm rounded-xl transition-all duration-300"
        >
          {showDetails ? 'Hide Details' : 'View Details'}
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={handleStatusToggle}
            className={`flex-1 py-3 px-4 font-bold text-sm rounded-xl transition-all duration-300 hover:scale-105 ${
              isActive
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                : 'bg-gradient-to-r from-primary to-secondary text-black hover:shadow-lg hover:shadow-primary/30'
            }`}
          >
            {isActive ? 'Pause Bot' : 'Start Bot'}
          </button>
          
          <Link
            href={`/bot/${id}`}
            className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-primary/50 text-white font-bold text-sm rounded-xl transition-all duration-300 hover:scale-105 text-center"
          >
            Details
          </Link>
        </div>
      </div>

      {/* Floating Status Indicator */}
      {isActive && (
        <div className="absolute top-4 right-4 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
      )}

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #14F195;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(20, 241, 149, 0.5);
          transition: all 0.3s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 15px rgba(20, 241, 149, 0.8);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #14F195;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(20, 241, 149, 0.5);
          transition: all 0.3s ease;
        }
        
        .slider::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 15px rgba(20, 241, 149, 0.8);
        }
      `}</style>
    </div>
  );
};

export default BotCard;