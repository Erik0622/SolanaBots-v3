'use client';

import React, { FC, useState, useEffect, useRef } from 'react';
import {
  BarChart3,
  Rocket,
  DollarSign,
  Zap,
  Shield,
  Activity,
  TrendingUp,
  Clock,
  Target,
  Brain,
  Lock,
  Users
} from 'lucide-react';

const Features: FC = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const features = [
    {
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze thousands of market indicators in real-time to identify optimal trading opportunities.",
      longDescription: "Our proprietary AI engine processes vast amounts of market data, technical indicators, social sentiment, and historical patterns to make split-second trading decisions with unprecedented accuracy.",
      icon: BarChart3,
      color: "from-blue-500 to-cyan-500",
      stats: { value: "98.7%", label: "Accuracy Rate" }
    },
    {
      title: "Lightning-Fast Execution", 
      description: "Execute trades in milliseconds on Solana's high-performance blockchain, ensuring you never miss profitable opportunities.",
      longDescription: "Built on Solana's ultra-fast infrastructure, our bots can execute complex trading strategies with sub-50ms latency, giving you a significant edge over traditional trading platforms.",
      icon: Rocket,
      color: "from-purple-500 to-pink-500", 
      stats: { value: "30ms", label: "Avg Execution" }
    },
    {
      title: "Smart Risk Management",
      description: "Intelligent position sizing, stop-losses, and portfolio diversification protect your capital while maximizing returns.",
      longDescription: "Our sophisticated risk management system automatically adjusts position sizes based on market volatility, implements dynamic stop-losses, and maintains optimal portfolio allocation across multiple assets.",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
      stats: { value: "12.8%", label: "Max Drawdown" }
    }
  ];

  const additionalFeatures = [
    {
      title: "24/7 Autonomous Trading",
      description: "Never sleep, never miss an opportunity. Our bots work around the clock.",
      icon: Clock,
      color: "text-blue-400"
    },
    {
      title: "Advanced Security",
      description: "Multi-layer security protocols keep your funds and strategies safe.",
      icon: Lock,
      color: "text-green-400"
    },
    {
      title: "Real-time Monitoring",
      description: "Live dashboards and instant alerts keep you informed of every move.",
      icon: Activity,
      color: "text-purple-400"
    },
    {
      title: "Community Insights",
      description: "Learn from top traders and share strategies with our community.",
      icon: Users,
      color: "text-orange-400"
    },
    {
      title: "Backtesting Engine",
      description: "Test strategies against historical data before deploying capital.",
      icon: TrendingUp,
      color: "text-cyan-400"
    },
    {
      title: "Risk Analytics",
      description: "Comprehensive risk metrics and portfolio analysis tools.",
      icon: Shield,
      color: "text-red-400"
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [features.length]);

  const activeFeatureData = features[activeFeature];
  const ActiveIcon = activeFeatureData.icon;

  return (
    <section ref={sectionRef} id="features" className="py-20 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className={`text-center mb-16 transform transition-all duration-1000 ${
          isInView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent flex-1 max-w-xs"></div>
            <Brain className="w-8 h-8 text-blue-400" />
            <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent flex-1 max-w-xs"></div>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Advanced <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Features</span>
          </h2>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Cutting-edge technology meets intuitive design. Experience the future of automated trading with features designed for both beginners and professionals.
          </p>
        </div>

        {/* Main Feature Showcase */}
        <div className={`grid lg:grid-cols-2 gap-12 mb-20 items-center transform transition-all duration-1000 delay-200 ${
          isInView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          
          {/* Feature Content */}
          <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <div className={`p-4 rounded-2xl bg-gradient-to-r ${activeFeatureData.color}`}>
                <ActiveIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white">{activeFeatureData.title}</h3>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-2xl font-bold text-blue-400">{activeFeatureData.stats.value}</span>
                  <span className="text-gray-400">{activeFeatureData.stats.label}</span>
                </div>
              </div>
            </div>

            <p className="text-lg text-gray-300 leading-relaxed">
              {activeFeatureData.longDescription}
            </p>

            {/* Feature Navigation */}
            <div className="flex space-x-4">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeFeature 
                      ? 'bg-blue-400 scale-125' 
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Feature Visualization */}
          <div className="relative">
            <div className="bg-gray-800/40 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-8 hover:border-gray-600/50 transition-all duration-300">
              <div className="text-center space-y-6">
                <div className={`p-6 rounded-2xl bg-gradient-to-r ${activeFeatureData.color} mx-auto w-24 h-24 flex items-center justify-center transform transition-all duration-500 hover:scale-110`}>
                  <ActiveIcon className="w-12 h-12 text-white" />
                </div>
                
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">{activeFeatureData.title}</h4>
                  <p className="text-gray-400">{activeFeatureData.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/60 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-400">↑ 24.7%</div>
                    <div className="text-sm text-gray-400">This Month</div>
                  </div>
                  <div className="bg-gray-800/60 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-400">1,247</div>
                    <div className="text-sm text-gray-400">Active Trades</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Features Grid */}
        <div className={`transform transition-all duration-1000 delay-400 ${
          isInView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">Everything You Need</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A comprehensive suite of tools and features designed to give you the competitive edge in cryptocurrency trading.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => {
              const FeatureIcon = feature.icon;
              
              return (
                <div
                  key={feature.title}
                  className={`group bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/50 hover:bg-gray-800/50 transition-all duration-300 hover:transform hover:scale-105 ${
                    isInView ? 'animate-fade-in-up' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${600 + index * 100}ms` }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <FeatureIcon className={`w-6 h-6 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                        {feature.title}
                      </h4>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Highlight */}
        <div className={`mt-20 text-center transform transition-all duration-1000 delay-600 ${
          isInView ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 border border-blue-500/30 rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Target className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">Peak Performance</span>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-black text-green-400 mb-2">+347%</div>
                <div className="text-gray-300">Best Monthly Return</div>
              </div>
              <div>
                <div className="text-3xl font-black text-blue-400 mb-2">99.9%</div>
                <div className="text-gray-300">Uptime Guarantee</div>
              </div>
              <div>
                <div className="text-3xl font-black text-purple-400 mb-2">50ms</div>
                <div className="text-gray-300">Average Execution</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features; 