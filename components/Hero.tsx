'use client';

import React, { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  TrendingUp, 
  Zap, 
  Rocket, 
  BarChart3, 
  ArrowRight, 
  Play,
  ShieldCheck,
  Target,
  Activity
} from 'lucide-react';

const Hero: FC = () => {
  const { connected } = useWallet();
  const [currentBot, setCurrentBot] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const bots = [
    {
      name: 'Volume Tracker',
      description: 'AI-powered volume analysis for optimal entry points',
      icon: BarChart3,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Momentum Surfer', 
      description: 'Rides market momentum with precision timing',
      icon: Zap,
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Trend Hunter',
      description: 'Identifies and capitalizes on emerging trends',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentBot((prev) => (prev + 1) % bots.length);
        setIsAnimating(false);
      }, 150);
    }, 4000);

    return () => clearInterval(interval);
  }, [bots.length]);

  const currentBotData = bots[currentBot];
  const IconComponent = currentBotData.icon;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black pt-32 lg:pt-24">
      
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-green-500 to-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Main Content */}
        <div className="space-y-8">
          
          {/* Header */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
                Solana Trading
              </span>
              <br />
              <span className="text-gray-100">
                Bots Platform
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Deploy autonomous AI trading bots on Solana. 
              <span className="text-blue-400 font-semibold"> Advanced algorithms</span> meet 
              <span className="text-purple-400 font-semibold"> real-time market data</span> for optimal performance.
            </p>
          </div>

          {/* Current Bot Showcase */}
          <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-8 max-w-2xl mx-auto transform transition-all duration-500 hover:scale-[1.02] hover:border-gray-600/50">
            <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${currentBotData.color}`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">{currentBotData.name}</h3>
              </div>
              <p className="text-gray-300 text-lg">{currentBotData.description}</p>
            </div>
            
            {/* Bot Indicator Dots */}
            <div className="flex justify-center space-x-2 mt-6">
              {bots.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBot(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentBot 
                      ? 'bg-blue-400 scale-125' 
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
            {/* Connect Wallet Button */}
            <div className="w-full sm:w-auto">
              <WalletMultiButton className="!w-full !bg-gradient-to-r !from-blue-600 !to-purple-600 !text-white !font-bold !rounded-xl !px-8 !py-4 !transition-all !duration-300 hover:!scale-105 hover:!shadow-lg hover:!shadow-blue-500/25" />
            </div>
            
            {/* Explore Bots Button */}
            <Link 
              href="#bots" 
              className="group w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-gray-800/80 backdrop-blur-sm border border-gray-600 text-white font-semibold rounded-xl transition-all duration-300 hover:border-gray-500 hover:bg-gray-700/80 hover:scale-105"
            >
              <Rocket className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Explore Bots
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/50 transition-all duration-300">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-2">98.2%</div>
              <div className="text-gray-400">Success Rate</div>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/50 transition-all duration-300">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-400">Active Trading</div>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/50 transition-all duration-300">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                  <Target className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-2">50ms</div>
              <div className="text-gray-400">Execution Speed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 