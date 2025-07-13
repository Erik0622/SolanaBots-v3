'use client';

import React, { FC, useState, useEffect, useRef } from 'react';
import { useFavoriteBots } from '@/hooks/useFavoriteBots';
import { saveBotRisk } from '@/lib/botState';
import Link from 'next/link';
import { useSimulation } from '@/hooks/useSimulation';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  Shield, 
  PlayCircle, 
  PauseCircle, 
  Star, 
  Eye, 
  Settings, 
  ChevronDown, 
  ChevronUp,
  Zap,
  DollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

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
    if (risk <= 10) return 'from-emerald-500 to-green-600';
    if (risk <= 20) return 'from-amber-500 to-orange-600';
    return 'from-red-500 to-red-600';
  };

  const getBotIcon = (botName: string) => {
    if (botName.includes('Volume')) return BarChart3;
    if (botName.includes('Momentum')) return TrendingUp;
    if (botName.includes('Dip')) return TrendingDown;
    return Activity;
  };

  const BotIcon = getBotIcon(name);

  return (
    <div 
      ref={cardRef}
      className="group relative w-full max-w-sm mx-auto"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer Glow */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${isActive ? 'from-primary to-secondary' : 'from-gray-600 to-gray-700'} rounded-2xl blur-sm opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>
      
      {/* Main Card */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl backdrop-blur-sm shadow-xl overflow-hidden">
        
        {/* Status Indicator */}
        {isActive && (
          <div className="absolute top-3 right-3 z-10">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-400">Active</span>
            </div>
          </div>
        )}

        <div className="p-6 space-y-6">
          
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className={`relative p-3 bg-gradient-to-br ${isActive ? 'from-primary/20 to-secondary/20' : 'from-gray-700/20 to-gray-600/20'} rounded-xl border border-gray-600/30 group-hover:scale-105 transition-transform duration-300`}>
              <BotIcon className={`w-8 h-8 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-white truncate">{name}</h3>
                {showFavoriteButton && (
                  <button
                    onClick={() => toggleFavorite(id)}
                    className={`p-1.5 rounded-lg transition-all duration-300 hover:scale-110 ${
                      isBotFavorite(id) 
                        ? 'bg-yellow-400/20 text-yellow-400' 
                        : 'bg-gray-700/50 text-gray-400 hover:text-yellow-400'
                    }`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-300 line-clamp-2">{description}</p>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/30">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-300">7-Day Performance</span>
              <Activity className="w-4 h-4 text-gray-400" />
            </div>
            
            {simulationLoading ? (
              <div className="flex items-center justify-center h-16">
                <div className="w-6 h-6 border-2 border-primary/30 rounded-full animate-spin border-t-primary"></div>
              </div>
            ) : performanceData.length > 0 ? (
              <div className="flex items-end justify-between h-16 gap-1">
                {performanceData.map((point, index) => {
                  const height = Math.max(8, Math.min(100, (Math.abs(point.value) / 50) * 100));
                  const isPositive = point.value >= 0;
                  return (
                    <div 
                      key={index} 
                      className="flex-1 flex flex-col justify-end group/bar cursor-pointer"
                      title={`Day ${point.day}: ${point.value > 0 ? '+' : ''}${point.value.toFixed(1)}%`}
                    >
                      <div
                        className={`w-full rounded-t transition-all duration-300 group-hover/bar:scale-110 ${
                          isPositive 
                            ? 'bg-gradient-to-t from-green-500 to-emerald-400 shadow-green-500/30' 
                            : 'bg-gradient-to-t from-red-500 to-red-400 shadow-red-500/30'
                        }`}
                        style={{ height: `${height}%` }}
                      ></div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-16 text-gray-500">
                <div className="text-center">
                  <BarChart3 className="w-6 h-6 mx-auto mb-1 opacity-50" />
                  <span className="text-xs">No data</span>
                </div>
              </div>
            )}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">Weekly</span>
              </div>
              <div className="text-lg font-bold text-green-400">{weeklyReturn}</div>
            </div>
            
            <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">Monthly</span>
              </div>
              <div className="text-lg font-bold text-blue-400">{monthlyReturn}</div>
            </div>
            
            <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400">Trades</span>
              </div>
              <div className="text-lg font-bold text-white">{trades}</div>
            </div>
            
            <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-gray-400">Win Rate</span>
              </div>
              <div className="text-lg font-bold text-amber-400">{winRate}</div>
            </div>
          </div>

          {/* Risk Management */}
          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-300">Risk Management</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${getRiskColorClass(currentRisk)}`}>
                  {currentRisk}%
                </span>
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getRiskGradient(currentRisk)} animate-pulse`}></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <input
                type="range"
                min="1"
                max="50"
                value={currentRisk}
                onChange={handleRiskChange}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-modern"
                style={{
                  background: `linear-gradient(to right, ${currentRisk <= 10 ? '#10b981' : currentRisk <= 20 ? '#f59e0b' : '#ef4444'} 0%, ${currentRisk <= 10 ? '#10b981' : currentRisk <= 20 ? '#f59e0b' : '#ef4444'} ${(currentRisk / 50) * 100}%, #374151 ${(currentRisk / 50) * 100}%, #374151 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Conservative</span>
                <span className={`${getRiskColorClass(currentRisk)} font-medium`}>
                  {getRiskLevelText(currentRisk)}
                </span>
                <span>Aggressive</span>
              </div>
            </div>
          </div>

          {/* Profit Overview */}
          {(profitToday > 0 || profitWeek > 0 || profitMonth > 0) && (
            <div className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-400/10 rounded-lg p-4 border border-green-500/20">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">Profit Overview</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">Today</div>
                  <div className="text-sm font-bold text-green-400">+${profitToday.toFixed(2)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">Week</div>
                  <div className="text-sm font-bold text-green-400">+${profitWeek.toFixed(2)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400 mb-1">Month</div>
                  <div className="text-sm font-bold text-green-400">+${profitMonth.toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Strategy Details (Expandable) */}
          {showDetails && strategy && (
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/30 animate-fade-in">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-300">Strategy Details</span>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">Algorithm:</span>
                  <p className="text-gray-300 mt-1 leading-relaxed">{strategy}</p>
                </div>
                {riskManagement && (
                  <div>
                    <span className="text-gray-400">Risk Management:</span>
                    <p className="text-gray-300 mt-1 leading-relaxed">{riskManagement}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600/50 hover:border-gray-500 text-gray-300 hover:text-white text-sm font-medium rounded-lg transition-all duration-300"
            >
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showDetails ? 'Hide Details' : 'Show Strategy'}
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleStatusToggle}
                className={`flex items-center justify-center gap-2 py-3 px-4 font-medium text-sm rounded-lg transition-all duration-300 hover:scale-[1.02] ${
                  isActive
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                    : 'bg-gradient-to-r from-primary to-secondary text-black hover:shadow-lg hover:shadow-primary/30 font-bold'
                }`}
              >
                {isActive ? (
                  <>
                    <PauseCircle className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4" />
                    Activate
                  </>
                )}
              </button>
              
              <Link
                href={`/bot/${id}`}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600/50 hover:border-gray-500 text-gray-300 hover:text-white font-medium text-sm rounded-lg transition-all duration-300 hover:scale-[1.02]"
              >
                <Eye className="w-4 h-4" />
                Details
              </Link>
            </div>
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"></div>
      </div>

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider-modern::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #14F195, #0CB574);
          cursor: pointer;
          box-shadow: 0 0 0 2px rgba(20, 241, 149, 0.3), 0 2px 8px rgba(20, 241, 149, 0.4);
          transition: all 0.3s ease;
          border: 2px solid white;
        }
        
        .slider-modern::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 0 4px rgba(20, 241, 149, 0.4), 0 4px 12px rgba(20, 241, 149, 0.6);
        }
        
        .slider-modern::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #14F195, #0CB574);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 0 2px rgba(20, 241, 149, 0.3), 0 2px 8px rgba(20, 241, 149, 0.4);
          transition: all 0.3s ease;
        }
        
        .slider-modern::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 0 4px rgba(20, 241, 149, 0.4), 0 4px 12px rgba(20, 241, 149, 0.6);
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default BotCard;