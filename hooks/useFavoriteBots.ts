'use client';

import { useState, useEffect } from 'react';
// Mock wallet adapter for build compatibility
const useWallet = () => ({ connected: false });
import { CustomBot } from './useCustomBots';

export function useFavoriteBots() {
  const wallet = useWallet();
  const [favoriteBots, setFavoriteBots] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Load favorite bots from localStorage only on client
    if (isClient && typeof window !== 'undefined') {
      const saved = localStorage.getItem('favoriteBots');
      if (saved) {
        try {
          setFavoriteBots(JSON.parse(saved));
        } catch (error) {
          console.error('Error loading favorite bots:', error);
        }
      }
    }
  }, [isClient]);

  const toggleFavorite = (botId: string) => {
    if (!isClient) return;
    
    const updatedFavorites = favoriteBots.includes(botId)
      ? favoriteBots.filter(id => id !== botId)
      : [...favoriteBots, botId];
    
    setFavoriteBots(updatedFavorites);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('favoriteBots', JSON.stringify(updatedFavorites));
    }
  };

  const isBotFavorite = (botId: string) => {
    return isClient ? favoriteBots.includes(botId) : false;
  };

  const addFavorite = (botId: string) => {
    if (!isClient || favoriteBots.includes(botId)) return;
    
    const updatedFavorites = [...favoriteBots, botId];
    setFavoriteBots(updatedFavorites);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('favoriteBots', JSON.stringify(updatedFavorites));
    }
  };

  const removeFavorite = (botId: string) => {
    if (!isClient) return;
    
    const updatedFavorites = favoriteBots.filter(id => id !== botId);
    setFavoriteBots(updatedFavorites);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('favoriteBots', JSON.stringify(updatedFavorites));
    }
  };

  return {
    favoriteBots,
    toggleFavorite,
    isBotFavorite,
    addFavorite,
    removeFavorite,
  };
} 