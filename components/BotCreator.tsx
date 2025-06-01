'use client';

import React, { FC, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import BotCard from './BotCard';
import { useCustomBots } from '@/hooks/useCustomBots';
import { toast } from 'react-hot-toast';

interface BotCreatorProps {}

const BotCreator: FC<BotCreatorProps> = () => {
  const wallet = useWallet();
  const { addCustomBot, customBots } = useCustomBots();
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState('');
  const [strategy, setStrategy] = useState('');
  const [riskReward, setRiskReward] = useState('1:3');
  const [tokenAge, setTokenAge] = useState('');
  const [minMarketCap, setMinMarketCap] = useState('100000');
  const [maxMarketCap, setMaxMarketCap] = useState('1000000');
  const [tradingStyle, setTradingStyle] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedBot, setGeneratedBot] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsVisible(true);
  }, []);

  // Zeige Loading während der Hydration
  if (!isClient) {
    return (
      <div className="py-20 px-6 bg-dark-light min-h-[60vh]">
        <div className="container mx-auto">
          <div className="flex items-center justify-center">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  const generateBot = async () => {
    if (!wallet.connected) {
      setError('Please connect your wallet first');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/simulation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          strategy,
          riskReward,
          tokenAge,
          minMarketCap: parseInt(minMarketCap),
          maxMarketCap: parseInt(maxMarketCap),
          tradingStyle,
          timeframe,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate bot');
      }

      const data = await response.json();
      
      const newBot = {
        name: title,
        description: data.description || `${strategy} trading bot with ${riskReward} risk/reward ratio`,
        weeklyReturn: data.weeklyReturn || '+12%',
        monthlyReturn: data.monthlyReturn || '+48%',
        trades: data.trades || 156,
        winRate: data.winRate || '76%',
        strategy: strategy,
        riskLevel: 'moderate' as const,
        riskColor: 'text-yellow-400',
        baseRiskPerTrade: 5,
        status: 'paused' as const,
        profitToday: 0,
        profitWeek: 0,
        profitMonth: 0,
        walletAddress: wallet.publicKey?.toString() || '',
        code: data.code,
        tradingStyle,
        timeframe,
      };

      const savedBot = addCustomBot(newBot);
      if (savedBot) {
        setGeneratedBot(savedBot);
        setCurrentStep(4);
        toast.success('Bot created successfully!');
      }
    } catch (error) {
      console.error('Error generating bot:', error);
      setError('Failed to generate bot. Please try again.');
      toast.error('Failed to generate bot');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setTitle('');
    setStrategy('');
    setRiskReward('1:3');
    setTokenAge('');
    setMinMarketCap('100000');
    setMaxMarketCap('1000000');
    setTradingStyle('');
    setTimeframe('');
    setError(null);
    setGeneratedBot(null);
  };

  return (
    <section className="py-20 px-6 bg-dark-light min-h-screen">
      <div className="container mx-auto max-w-4xl">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Bot <span className="text-primary">Creator</span>
            </h2>
            <p className="text-white/70 text-lg">
              Create your custom trading bot in minutes
            </p>
          </div>

          {!wallet.connected ? (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
              <div className="text-6xl mb-6">🔒</div>
              <h3 className="text-2xl font-bold mb-4">Connect Your Wallet</h3>
              <p className="text-white/70 mb-8">
                You need to connect your wallet to create and manage your custom trading bots.
              </p>
              <WalletMultiButton className="!bg-gradient-to-r !from-primary !to-secondary !text-black !font-bold !px-8 !py-4 !rounded-xl !text-lg" />
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                        step <= currentStep
                          ? 'bg-primary border-primary text-black'
                          : 'border-white/30 text-white/50'
                      }`}
                    >
                      {step < currentStep ? '✓' : step}
                    </div>
                  ))}
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Step Content */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold mb-6">Basic Information</h3>
                  
                  <div>
                    <label className="block text-white/70 mb-2">Bot Name *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:border-primary focus:outline-none transition-colors"
                      placeholder="e.g., My SOL Scalper"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 mb-2">Trading Strategy *</label>
                    <select
                      value={strategy}
                      onChange={(e) => setStrategy(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:border-primary focus:outline-none transition-colors"
                    >
                      <option value="">Select a strategy</option>
                      <option value="Scalping">Scalping</option>
                      <option value="Swing Trading">Swing Trading</option>
                      <option value="Mean Reversion">Mean Reversion</option>
                      <option value="Momentum Trading">Momentum Trading</option>
                      <option value="Arbitrage">Arbitrage</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/70 mb-2">Risk/Reward Ratio</label>
                    <select
                      value={riskReward}
                      onChange={(e) => setRiskReward(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:border-primary focus:outline-none transition-colors"
                    >
                      <option value="1:2">1:2 (Conservative)</option>
                      <option value="1:3">1:3 (Balanced)</option>
                      <option value="1:4">1:4 (Aggressive)</option>
                      <option value="1:5">1:5 (Very Aggressive)</option>
                    </select>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold mb-6">Market Filters</h3>
                  
                  <div>
                    <label className="block text-white/70 mb-2">Token Age Filter</label>
                    <select
                      value={tokenAge}
                      onChange={(e) => setTokenAge(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:border-primary focus:outline-none transition-colors"
                    >
                      <option value="">No filter</option>
                      <option value="24h">At least 24 hours</option>
                      <option value="7d">At least 7 days</option>
                      <option value="30d">At least 30 days</option>
                      <option value="90d">At least 90 days</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/70 mb-2">Min Market Cap ($)</label>
                      <input
                        type="number"
                        value={minMarketCap}
                        onChange={(e) => setMinMarketCap(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:border-primary focus:outline-none transition-colors"
                        placeholder="100000"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 mb-2">Max Market Cap ($)</label>
                      <input
                        type="number"
                        value={maxMarketCap}
                        onChange={(e) => setMaxMarketCap(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:border-primary focus:outline-none transition-colors"
                        placeholder="1000000"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold mb-6">Trading Preferences</h3>
                  
                  <div>
                    <label className="block text-white/70 mb-2">Trading Style</label>
                    <select
                      value={tradingStyle}
                      onChange={(e) => setTradingStyle(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:border-primary focus:outline-none transition-colors"
                    >
                      <option value="">Select style</option>
                      <option value="Conservative">Conservative (Lower risk, steady gains)</option>
                      <option value="Balanced">Balanced (Moderate risk/reward)</option>
                      <option value="Aggressive">Aggressive (Higher risk, higher potential)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/70 mb-2">Primary Timeframe</label>
                    <select
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:border-primary focus:outline-none transition-colors"
                    >
                      <option value="">Select timeframe</option>
                      <option value="1m">1 Minute (Ultra short-term)</option>
                      <option value="5m">5 Minutes (Short-term)</option>
                      <option value="15m">15 Minutes (Medium-term)</option>
                      <option value="1h">1 Hour (Long-term)</option>
                      <option value="4h">4 Hours (Swing trading)</option>
                    </select>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-400 mb-2">Bot Preview</h4>
                    <div className="text-sm text-white/70 space-y-1">
                      <p><strong>Name:</strong> {title || 'Unnamed Bot'}</p>
                      <p><strong>Strategy:</strong> {strategy || 'Not selected'}</p>
                      <p><strong>Risk/Reward:</strong> {riskReward}</p>
                      <p><strong>Trading Style:</strong> {tradingStyle || 'Not selected'}</p>
                      <p><strong>Timeframe:</strong> {timeframe || 'Not selected'}</p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && generatedBot && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-2xl font-bold mb-2">Bot Created Successfully!</h3>
                    <p className="text-white/70">Your custom trading bot is ready to use.</p>
                  </div>

                  <div className="max-w-md mx-auto">
                    <BotCard
                      {...generatedBot}
                      showFavoriteButton={false}
                    />
                  </div>

                  <div className="text-center space-y-4">
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={() => window.location.href = '/my-bots'}
                        className="bg-gradient-to-r from-primary to-secondary text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
                      >
                        View My Bots
                      </button>
                      <button
                        onClick={resetForm}
                        className="bg-white/10 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors"
                      >
                        Create Another
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                  {error}
                </div>
              )}

              {/* Navigation Buttons */}
              {currentStep < 4 && (
                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${
                      currentStep === 1
                        ? 'bg-white/5 text-white/50 cursor-not-allowed'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                    disabled={currentStep === 1}
                  >
                    Previous
                  </button>

                  {currentStep === 3 ? (
                    <button
                      onClick={generateBot}
                      disabled={isGenerating || !title || !strategy}
                      className={`px-6 py-3 rounded-xl font-bold transition-all ${
                        isGenerating || !title || !strategy
                          ? 'bg-gray-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-primary to-secondary text-black hover:scale-105'
                      }`}
                    >
                      {isGenerating ? (
                        <span className="flex items-center gap-2">
                          <div className="loading-spinner"></div>
                          Generating...
                        </span>
                      ) : (
                        'Create Bot'
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentStep(currentStep + 1)}
                      disabled={currentStep === 1 && (!title || !strategy)}
                      className={`px-6 py-3 rounded-xl font-bold transition-all ${
                        currentStep === 1 && (!title || !strategy)
                          ? 'bg-gray-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-primary to-secondary text-black hover:scale-105'
                      }`}
                    >
                      Next
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BotCreator; 