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
  riskLevel?: 'low' | 'medium' | 'high';
  status: 'active' | 'inactive';
  isActive: boolean;
  onToggle: (id: string) => void;
  riskPercentage: number;
  onRiskChange: (risk: number) => void;
  riskManagement?: string;
}

// Mock performance data generator
const generateMockChartData = (trend: 'up' | 'down' | 'neutral' = 'up') => {
  const days = 7;
  const data = [];
  let baseValue = 100;
  
  for (let i = 0; i < days; i++) {
    let change = 0;
    
    if (trend === 'up') {
      change = Math.random() * 3 - 0.5; // Generally positive trend
    } else if (trend === 'down') {
      change = Math.random() * 2 - 2.5; // Generally negative trend
    } else {
      change = Math.random() * 4 - 2; // Neutral/volatile trend
    }
    
    baseValue += change;
    data.push({
      day: i + 1,
      value: Math.max(85, Math.min(125, baseValue)), // Keep within reasonable bounds
      return: ((baseValue - 100) / 100 * 100).toFixed(1)
    });
  }
  
  return data;
};

const MiniPerformanceChart: FC<{ data: any[]; trend: 'up' | 'down' | 'neutral' }> = ({ data, trend }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  const chartColor = trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#6B7280';
  const fillColor = trend === 'up' ? 'rgba(16, 185, 129, 0.1)' : trend === 'down' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(107, 114, 128, 0.1)';
  
  const width = 280;
  const height = 60;
  const padding = 10;
  
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const valueRange = maxValue - minValue || 1;
  
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((d.value - minValue) / valueRange) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');
  
  const pathD = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((d.value - minValue) / valueRange) * (height - 2 * padding);
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');
  
  const fillPath = `${pathD} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;
  
  return (
    <div className="relative">
      <svg ref={svgRef} width={width} height={height} className="w-full h-full">
        {/* Fill area */}
        <path
          d={fillPath}
          fill={fillColor}
          className="transition-all duration-300"
        />
        
        {/* Line */}
        <path
          d={pathD}
          stroke={chartColor}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />
        
        {/* Data points */}
        {data.map((d, i) => {
          const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
          const y = height - padding - ((d.value - minValue) / valueRange) * (height - 2 * padding);
          
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2"
              fill={chartColor}
              className="transition-all duration-300 hover:r-3"
            />
          );
        })}
        
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="20" height="10" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 10" fill="none" stroke="rgba(156, 163, 175, 0.1)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      
      {/* Hover tooltip */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200">
        <div className="absolute top-1 right-1 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg">
          7-day trend
        </div>
      </div>
    </div>
  );
};

const BotCard: FC<BotCardProps> = ({
  id,
  name,
  description,
  weeklyReturn,
  monthlyReturn,
  trades,
  winRate,
  strategy,
  riskLevel = 'medium',
  status,
  isActive,
  onToggle,
  riskPercentage,
  onRiskChange,
  riskManagement
}) => {
  const { isBotFavorite, toggleFavorite } = useFavoriteBots();
  const [isExpanded, setIsExpanded] = useState(false);
  const [localRisk, setLocalRisk] = useState(riskPercentage);
  const [isSimulating, setIsSimulating] = useState(false);
  // Generate mock chart data based on performance
  const performanceTrend = weeklyReturn.includes('+') ? 'up' : weeklyReturn.includes('-') ? 'down' : 'neutral';
  const chartData = generateMockChartData(performanceTrend);

  const currentReturn = chartData[chartData.length - 1]?.return || '0.0';
  
  useEffect(() => {
    setLocalRisk(riskPercentage);
  }, [riskPercentage]);

  const handleRiskChange = (newRisk: number) => {
    setLocalRisk(newRisk);
    onRiskChange(newRisk);
    saveBotRisk(id, newRisk);
  };

  const handleSimulation = async () => {
    setIsSimulating(!isSimulating);
    // Simulation logic would go here
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'high': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getIcon = () => {
    if (id.includes('volume')) return Activity;
    if (id.includes('trend') || id.includes('momentum')) return TrendingUp;
    if (id.includes('dip') || id.includes('hunter')) return Target;
    return BarChart3;
  };

  const IconComponent = getIcon();

  return (
    <div className="group relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/50 transition-all duration-300 hover:transform hover:scale-[1.02] backdrop-blur-sm overflow-hidden">
      
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
      
      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${
              isActive 
                ? 'from-green-500/20 to-emerald-500/20 border border-green-500/30' 
                : 'from-gray-600/20 to-gray-500/20 border border-gray-500/30'
            }`}>
              <IconComponent className={`w-6 h-6 ${
                isActive ? 'text-green-400' : 'text-gray-400'
              }`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                  {name}
                </h3>
                
                {/* Status indicator */}
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isActive 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                }`}>
                  {isActive ? 'LIVE' : 'PAUSED'}
                </div>
              </div>
              
              <p className="text-sm text-gray-400 line-clamp-2 group-hover:text-gray-300 transition-colors">
                {description}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => toggleFavorite(id)}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                isBotFavorite(id)
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:border-gray-500'
              }`}
            >
              <Star className={`w-4 h-4 ${isBotFavorite(id) ? 'fill-current' : ''}`} />
            </button>
            
            <Link href={`/bot/${id}`}>
              <button className="p-2 rounded-lg bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:border-gray-500 hover:text-white hover:scale-110 transition-all duration-200">
                <Eye className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>

        {/* Performance Chart */}
        <div className="mb-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">7-Day Performance</span>
            </div>
            <div className={`flex items-center space-x-1 text-sm font-medium ${
              performanceTrend === 'up' ? 'text-green-400' : 
              performanceTrend === 'down' ? 'text-red-400' : 'text-gray-400'
            }`}>
              {performanceTrend === 'up' ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : performanceTrend === 'down' ? (
                <ArrowDownRight className="w-4 h-4" />
              ) : (
                <Activity className="w-4 h-4" />
              )}
              <span>{currentReturn}%</span>
            </div>
          </div>
          
          <MiniPerformanceChart data={chartData} trend={performanceTrend} />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/40">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Weekly</span>
            </div>
            <span className={`text-sm font-bold ${
              weeklyReturn.includes('+') ? 'text-green-400' : 
              weeklyReturn.includes('-') ? 'text-red-400' : 'text-gray-300'
            }`}>
              {weeklyReturn}
            </span>
          </div>

          <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/40">
            <div className="flex items-center space-x-2 mb-1">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-gray-400">Monthly</span>
            </div>
            <span className={`text-sm font-bold ${
              monthlyReturn.includes('+') ? 'text-green-400' : 
              monthlyReturn.includes('-') ? 'text-red-400' : 'text-gray-300'
            }`}>
              {monthlyReturn}
            </span>
          </div>

          <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/40">
            <div className="flex items-center space-x-2 mb-1">
              <Activity className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-gray-400">Trades</span>
            </div>
            <span className="text-sm font-bold text-white">{trades}</span>
          </div>

          <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/40">
            <div className="flex items-center space-x-2 mb-1">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Win Rate</span>
            </div>
            <span className="text-sm font-bold text-green-400">{winRate}</span>
          </div>
        </div>

        {/* Controls Section */}
        <div className="space-y-3">
          {/* Risk Management */}
          <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-gray-300">Risk Level</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(riskLevel)}`}>
                  {riskLevel.toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-bold text-white">{localRisk}%</span>
            </div>
            
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="50"
                value={localRisk}
                onChange={(e) => handleRiskChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #10B981 0%, #F59E0B ${localRisk}%, #374151 ${localRisk}%, #374151 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Conservative (1%)</span>
                <span>Aggressive (50%)</span>
              </div>
            </div>
          </div>

          {/* Bot Controls */}
          <div className="flex items-center space-x-3">
            {/* Toggle Button */}
            <button
              onClick={() => onToggle(id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex-1 justify-center ${
                isActive
                  ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white'
                  : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white'
              }`}
            >
              {isActive ? (
                <>
                  <PauseCircle className="w-4 h-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4" />
                  <span>Start</span>
                </>
              )}
            </button>

            {/* Simulation Button */}
            <button
              onClick={handleSimulation}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 border ${
                isSimulating
                  ? 'bg-yellow-600/20 border-yellow-500/30 text-yellow-400 hover:bg-yellow-600/30'
                  : 'bg-gray-700/50 border-gray-600/50 text-gray-300 hover:border-gray-500 hover:text-white'
              }`}
            >
              {isSimulating ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Simulating</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Test Run</span>
                </div>
              )}
            </button>

            {/* Expand Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg bg-gray-700/50 border border-gray-600/50 text-gray-400 hover:border-gray-500 hover:text-white transition-all duration-200"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-3 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-400">Strategy</span>
                <p className="text-sm text-white font-medium">{strategy || 'Advanced Algorithm'}</p>
              </div>
              <div>
                <span className="text-xs text-gray-400">Last Updated</span>
                <p className="text-sm text-white">Just now</p>
              </div>
            </div>

            {riskManagement && (
              <div className="mt-2">
                <span className="text-xs text-gray-400">Risk Details</span>
                <p className="text-sm text-white">{riskManagement}</p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs border border-blue-500/30">
                AI-Powered
              </span>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs border border-purple-500/30">
                Real-time
              </span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs border border-green-500/30">
                Multi-timeframe
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BotCard;