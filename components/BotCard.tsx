'use client';

import React, { FC, useState, useEffect, useRef } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const { isBotFavorite, toggleFavorite } = useFavoriteBots();

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

  // Mouse tracking for 3D effects
  const handleMouseMove = (e: React.MouseEvent) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
    }
  };

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
    if (risk <= 10) return 'text-emerald-400';
    if (risk <= 20) return 'text-amber-400';
    return 'text-red-400';
  };

  const getRiskLevelText = (risk: number) => {
    if (risk <= 10) return 'Conservative';
    if (risk <= 20) return 'Moderate';
    return 'Aggressive';
  };

  const getRiskGradient = (risk: number) => {
    if (risk <= 10) return 'from-emerald-400 to-green-500';
    if (risk <= 20) return 'from-amber-400 to-orange-500';
    return 'from-red-400 to-red-600';
  };

  const getBotIcon = (botName: string) => {
    if (botName.includes('Volume')) return '📊';
    if (botName.includes('Momentum')) return '🚀';
    if (botName.includes('Dip')) return '💎';
    return '🤖';
  };

  return (
    <div 
      ref={cardRef}
      className="group relative perspective-1000 transform-gpu"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      style={{
        transform: isHovered 
          ? `rotateY(${(mousePosition.x - 200) / 40}deg) rotateX(${-(mousePosition.y - 150) / 40}deg) translateZ(20px)`
          : 'rotateY(0deg) rotateX(0deg) translateZ(0px)',
        transition: 'transform 0.3s ease-out'
      }}
    >
      {/* Outer Glow & Shadow */}
      <div className={`absolute -inset-2 bg-gradient-to-r ${isActive ? 'from-primary to-secondary' : 'from-gray-600 to-gray-800'} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>
      
      {/* Main Card Container */}
      <div className="relative bg-gradient-to-br from-white/[0.12] via-white/[0.08] to-white/[0.04] backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden transition-all duration-500 hover:border-white/40 hover:shadow-2xl hover:shadow-primary/20">
        
        {/* Dynamic Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute inset-0 bg-gradient-radial"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(20, 241, 149, 0.15) 0%, transparent 50%)`,
              transition: 'background 0.3s ease',
            }}
          ></div>
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 p-8">
          
          {/* Header Section */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              {/* Bot Icon */}
              <div className={`relative w-16 h-16 bg-gradient-to-br ${isActive ? 'from-primary/20 to-secondary/20' : 'from-gray-600/20 to-gray-800/20'} rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                <span className="text-3xl filter drop-shadow-lg">{getBotIcon(name)}</span>
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                )}
              </div>

              {/* Bot Name & Description */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-black bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-secondary transition-all duration-300">
                    {name}
                  </h3>
                  {showFavoriteButton && (
                    <button
                      onClick={() => toggleFavorite(id)}
                      className={`group/fav p-2 rounded-full backdrop-blur-sm border border-white/10 transition-all duration-300 hover:scale-110 ${
                        isBotFavorite(id) 
                          ? 'bg-yellow-400/20 border-yellow-400/30 text-yellow-400' 
                          : 'bg-white/5 hover:bg-yellow-400/10 text-white/60 hover:text-yellow-400'
                      }`}
                    >
                      <svg className="w-5 h-5 fill-current transition-transform duration-300 group-hover/fav:rotate-12" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="text-white/70 text-sm leading-relaxed max-w-xs">{description}</p>
              </div>
            </div>

            {/* Status & Risk Badges */}
            <div className="flex flex-col gap-2">
              <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm border transition-all duration-300 ${
                isActive 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30 shadow-lg shadow-green-500/20' 
                  : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
              }`}>
                {isActive ? '🟢 Active' : '⏸️ Paused'}
              </div>
              <div className={`px-4 py-2 rounded-full text-xs font-bold ${getRiskColorClass(currentRisk)} bg-white/5 border border-white/10 backdrop-blur-sm text-center shadow-sm`}>
                {getRiskLevelText(currentRisk)}
              </div>
            </div>
          </div>

          {/* Enhanced Performance Chart */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-white/80 font-semibold text-sm">Performance Chart</h4>
              <span className="text-xs text-white/60">Last 7 Days</span>
            </div>
            <div className="relative h-20 bg-gradient-to-r from-black/20 to-black/10 rounded-2xl p-3 border border-white/10 backdrop-blur-sm overflow-hidden">
              {simulationLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="relative">
                    <div className="w-8 h-8 border-4 border-primary/30 rounded-full animate-spin border-t-primary"></div>
                    <div className="absolute inset-0 w-8 h-8 border-4 border-transparent rounded-full animate-ping border-t-primary/60"></div>
                  </div>
                </div>
              ) : performanceData.length > 0 ? (
                <div className="flex items-end justify-between h-full space-x-1">
                  {performanceData.map((point, index) => {
                    const height = Math.max(10, Math.min(100, (Math.abs(point.value) / 50) * 100));
                    const isPositive = point.value >= 0;
                    return (
                      <div key={index} className="flex-1 flex flex-col justify-end">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-500 hover:scale-110 ${
                            isPositive 
                              ? 'bg-gradient-to-t from-green-400 to-emerald-300 shadow-lg shadow-green-400/30' 
                              : 'bg-gradient-to-t from-red-400 to-red-300 shadow-lg shadow-red-400/30'
                          }`}
                          style={{ height: `${height}%` }}
                          title={`Day ${point.day}: ${point.value > 0 ? '+' : ''}${point.value.toFixed(1)}%`}
                        >
                          <div className="w-full h-full rounded-t-lg bg-gradient-to-t from-transparent to-white/20"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-white/40 text-xs text-center">
                    <div className="w-6 h-6 mx-auto mb-1 opacity-50">📊</div>
                    No Data Available
                  </div>
                </div>
              )}
              
              {/* Chart overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 pointer-events-none"></div>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Weekly', value: weeklyReturn, icon: '📈', gradient: 'from-green-400 to-emerald-500' },
              { label: 'Monthly', value: monthlyReturn, icon: '📊', gradient: 'from-blue-400 to-cyan-500' },
              { label: 'Trades', value: trades.toString(), icon: '⚡', gradient: 'from-purple-400 to-pink-500' },
              { label: 'Win Rate', value: winRate, icon: '🎯', gradient: 'from-amber-400 to-orange-500' }
            ].map((stat, index) => (
              <div key={stat.label} className="group/stat relative">
                <div className="bg-white/[0.08] backdrop-blur-sm border border-white/10 hover:border-white/20 rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:bg-white/[0.12]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{stat.icon}</span>
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.gradient} animate-pulse`}></div>
                  </div>
                  <p className="text-white/60 text-xs mb-1 font-medium">{stat.label}</p>
                  <p className={`font-black text-lg bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Risk Management */}
          <div className="mb-6 p-4 bg-gradient-to-r from-white/[0.08] to-white/[0.04] backdrop-blur-sm border border-white/10 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">⚖️</span>
                <span className="text-white/80 text-sm font-semibold">Risk Management</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${getRiskColorClass(currentRisk)}`}>
                  {currentRisk}%
                </span>
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getRiskGradient(currentRisk)} animate-pulse`}></div>
              </div>
            </div>
            
            <div className="relative mb-3">
              <input
                type="range"
                min="1"
                max="50"
                value={currentRisk}
                onChange={handleRiskChange}
                className="w-full h-3 bg-gradient-to-r from-white/10 to-white/5 rounded-full appearance-none cursor-pointer slider-modern"
                style={{
                  background: `linear-gradient(to right, ${currentRisk <= 10 ? '#10b981' : currentRisk <= 20 ? '#f59e0b' : '#ef4444'} 0%, ${currentRisk <= 10 ? '#10b981' : currentRisk <= 20 ? '#f59e0b' : '#ef4444'} ${(currentRisk / 50) * 100}%, rgba(255,255,255,0.1) ${(currentRisk / 50) * 100}%, rgba(255,255,255,0.1) 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-white/40 mt-2">
                <span>Conservative</span>
                <span className={`${getRiskColorClass(currentRisk)} font-semibold`}>
                  {getRiskLevelText(currentRisk)}
                </span>
                <span>Aggressive</span>
              </div>
            </div>
          </div>

          {/* Enhanced Profit Display */}
          {(profitToday > 0 || profitWeek > 0 || profitMonth > 0) && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-400/10 rounded-xl border border-green-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">💰</span>
                <h4 className="text-green-400 font-bold text-sm">Profit Overview</h4>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Today', value: profitToday, icon: '☀️' },
                  { label: 'Week', value: profitWeek, icon: '📅' },
                  { label: 'Month', value: profitMonth, icon: '📊' }
                ].map((profit) => (
                  <div key={profit.label} className="text-center">
                    <div className="text-xs text-white/60 mb-1 flex items-center justify-center gap-1">
                      <span>{profit.icon}</span>
                      {profit.label}
                    </div>
                    <div className="text-green-400 font-black text-sm">
                      +${profit.value.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expandable Strategy Details */}
          {showDetails && (
            <div className="mb-6 p-4 bg-gradient-to-r from-white/[0.06] to-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl animate-fade-in-up">
              <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                <span>🧠</span>
                Strategy Intelligence
              </h4>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-white/60">Algorithm:</span>
                  <p className="text-white/80 leading-relaxed mt-1">{strategy}</p>
                </div>
                {riskManagement && (
                  <div>
                    <span className="text-white/60">Risk Management:</span>
                    <p className="text-white/80 leading-relaxed mt-1">{riskManagement}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full py-3 px-4 bg-white/[0.08] hover:bg-white/[0.12] border border-white/20 hover:border-primary/50 text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm"
            >
              <span className="flex items-center justify-center gap-2">
                <span>{showDetails ? '🔼' : '🔽'}</span>
                {showDetails ? 'Hide Strategy Details' : 'View Strategy Details'}
              </span>
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleStatusToggle}
                className={`py-3 px-4 font-bold text-sm rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                  isActive
                    ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border border-red-500/30 hover:from-red-500/30 hover:to-red-600/30 backdrop-blur-sm'
                    : 'bg-gradient-to-r from-primary to-secondary text-black hover:shadow-lg hover:shadow-primary/30 font-black'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  {isActive ? '⏸️ Pause Bot' : '▶️ Activate Bot'}
                </span>
              </button>
              
              <Link
                href={`/bot/${id}`}
                className="py-3 px-4 bg-white/[0.08] hover:bg-white/[0.12] border border-white/20 hover:border-secondary/50 text-white font-bold text-sm rounded-xl transition-all duration-300 hover:scale-[1.02] text-center backdrop-blur-sm"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>🔍</span>
                  View Details
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Active Indicator */}
        {isActive && (
          <div className="absolute top-4 right-4">
            <div className="relative">
              <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <div className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-75"></div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Slider Styles */}
      <style jsx>{`
        .slider-modern::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #14F195, #0CB574);
          cursor: pointer;
          box-shadow: 0 0 0 3px rgba(20, 241, 149, 0.3), 0 4px 12px rgba(20, 241, 149, 0.4);
          transition: all 0.3s ease;
          border: 2px solid white;
        }
        
        .slider-modern::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 0 6px rgba(20, 241, 149, 0.4), 0 6px 20px rgba(20, 241, 149, 0.6);
        }
        
        .slider-modern::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #14F195, #0CB574);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 0 3px rgba(20, 241, 149, 0.3), 0 4px 12px rgba(20, 241, 149, 0.4);
          transition: all 0.3s ease;
        }
        
        .slider-modern::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 0 6px rgba(20, 241, 149, 0.4), 0 6px 20px rgba(20, 241, 149, 0.6);
        }

        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};

export default BotCard;