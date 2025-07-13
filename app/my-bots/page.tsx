'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import BotCard from '@/components/BotCard';
import Header from '@/components/Header';
import { useCustomBots } from '@/hooks/useCustomBots';
import { useFavoriteBots } from '@/hooks/useFavoriteBots';
import { predefinedBots } from '@/config/bots';
import { Star, Rocket } from 'lucide-react';
import Link from 'next/link';

const MyBotsPage = () => {
  const wallet = useWallet();
  const { customBots } = useCustomBots();
  const { favoriteBots } = useFavoriteBots();
  const [activeTab, setActiveTab] = useState<'created' | 'favorites'>('created');
  const [isClient, setIsClient] = useState(false);

  // Stelle sicher, dass wir auf dem Client sind
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Filter favorisierte Bots aus den vordefinierten Bots nur auf dem Client
  const favoriteBotsFromPredefined = isClient ? predefinedBots.filter(bot => 
    favoriteBots.includes(bot.id)
  ) : [];

  // Zeige Loading während der Hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-dark-light">
        <Header />
        <div className="py-20 px-6 min-h-[60vh] mt-16">
          <div className="container mx-auto">
            <div className="flex items-center justify-center">
              <div className="loading-spinner"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-dark-light">
        <Header />
        <div className="py-20 px-6 min-h-[60vh] mt-16">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">My Bots</h2>
            <p className="text-white/80 mb-8">Connect your wallet to access your bots.</p>
            <WalletMultiButton className="btn-primary px-8 py-3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-light">
      <Header />
      <div className="py-20 px-6 min-h-screen mt-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8">My Bots</h2>
          
          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab('created')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'created'
                  ? 'bg-gradient-to-r from-primary to-secondary text-black'
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              Created Bots ({customBots.length})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'favorites'
                  ? 'bg-gradient-to-r from-primary to-secondary text-black'
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              Favorites ({favoriteBotsFromPredefined.length})
            </button>
          </div>

          {/* Content */}
          {activeTab === 'created' && (
            <div>
              {customBots.length === 0 ? (
                <div className="text-center space-y-6">
                  <div className="p-8 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl">
                    <Star className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-3xl font-bold text-white mb-4">No Bots Created Yet</h3>
                    <p className="text-gray-300 text-lg mb-6">
                      Create your first custom trading bot to get started with automated trading on Solana.
                    </p>
                    <Link
                      href="/launchpad"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition-all duration-200"
                    >
                      <Rocket className="w-5 h-5 mr-2" />
                      Create Your First Bot
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {customBots.map((bot) => (
                    <BotCard
                      key={bot.id}
                      {...bot}
                      riskLevel={bot.riskLevel === 'moderate' ? 'medium' : bot.riskLevel as any}
                      status={'active'}
                      isActive={true}
                      onToggle={() => {}}
                      riskPercentage={25}
                      onRiskChange={() => {}}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div>
              {favoriteBotsFromPredefined.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">⭐</div>
                  <h3 className="text-2xl font-bold mb-4">No Favorite Bots Yet</h3>
                  <p className="text-white/60 mb-8">
                    Add bots to your favorites to quickly access them here.
                  </p>
                  <a
                    href="/#bots"
                    className="inline-block bg-gradient-to-r from-primary to-secondary text-black px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
                  >
                    Browse Bots
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {favoriteBotsFromPredefined.map((bot) => (
                    <BotCard
                      key={bot.id}
                      {...bot}
                      riskLevel={bot.riskLevel === 'moderate' ? 'medium' : bot.riskLevel as any}
                      status={'active'}
                      isActive={true}
                      onToggle={() => {}}
                      riskPercentage={25}
                      onRiskChange={() => {}}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBotsPage; 