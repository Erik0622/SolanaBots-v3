'use client';

import { useState, useEffect } from 'react';

export interface SimulationSummary {
  profitPercentage: number;
  tradeCount: number;
  successRate: number;
  dailyData: { date: string; value: number }[];
  isLoading: boolean;
  realTokens?: any[]; // Für echte Token-Daten
  error?: string;
}

export const useSimulation = (
  botId: string, 
  autoRefresh: boolean = false,
  useRealAPI: boolean = true, // STANDARD: Echte Marktdaten!
  useBitquery: boolean = true // NEU: Bitquery für beste Memecoin-Daten
) => {
  const [simulation, setSimulation] = useState<SimulationSummary>({
    profitPercentage: 0,
    tradeCount: 0,
    successRate: 0,
    dailyData: [],
    isLoading: true
  });
  
  const [error, setError] = useState<string | null>(null);

  const loadSimulation = async () => {
    try {
      setError(null);
      setSimulation(prev => ({ ...prev, isLoading: true }));
      
      // NUR ECHTE BITQUERY API-DATEN - Keine Mock-Fallbacks!
      console.log(`🔍 Loading REAL Bitquery data for bot ${botId} - NO MOCK DATA!`);
      
      const response = await fetch('/api/simulation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botType: botId,
          tokenCount: 10,
          useBitquery: true // Immer Bitquery verwenden
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Bitquery API Error: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      
      console.log(`✅ Received REAL data for ${botId}:`, {
        profitPercentage: result.profitPercentage,
        tradeCount: result.tradeCount,
        tokenCount: result.tokens?.length || 0
      });
      
      setSimulation({
        profitPercentage: result.profitPercentage,
        tradeCount: result.tradeCount,
        successRate: result.successRate,
        dailyData: result.dailyData,
        realTokens: result.tokens,
        isLoading: false
      });
      
    } catch (err) {
      console.error(`❌ BITQUERY SIMULATION FAILED for ${botId}:`, err);
      setError(err instanceof Error ? err.message : 'Could not load real simulation data.');
      
      // KEINE Mock-Fallbacks mehr! User soll echte Fehler sehen
      setSimulation({
        profitPercentage: 0,
        tradeCount: 0,
        successRate: 0,
        dailyData: [],
        isLoading: false,
        error: `Bitquery API failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      });
    }
  };

  const refreshSimulation = async () => {
    console.log(`🔄 Refreshing REAL data for ${botId}...`);
    await loadSimulation(); // Einfach neu laden - keine Mock-Fallbacks
  };

  const toggleDataSource = async (newUseBitquery: boolean) => {
    setSimulation(prev => ({ ...prev, isLoading: true }));
    setError(null);
    
    try {
      console.log(`🔄 Switching to ${newUseBitquery ? 'BITQUERY' : 'LEGACY'} API for bot ${botId}`);
      
      const response = await fetch('/api/simulation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botType: botId,
          tokenCount: 10,
          useBitquery: newUseBitquery
        })
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const result = await response.json();
      
      setSimulation({
        profitPercentage: result.profitPercentage,
        tradeCount: result.tradeCount,
        successRate: result.successRate,
        dailyData: result.dailyData,
        realTokens: result.tokens,
        isLoading: false
      });
      
    } catch (err) {
      console.error('Toggle data source failed:', err);
      setError(err instanceof Error ? err.message : 'Could not switch data source');
      
      // KEINE Mock-Fallbacks!
      setSimulation(prev => ({
        ...prev,
        isLoading: false,
        error: `Data source switch failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      }));
    }
  };

  useEffect(() => {
    loadSimulation();
  }, [botId, useBitquery]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(refreshSimulation, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, botId]);

  return {
    simulation,
    error,
    refreshSimulation,
    toggleDataSource,
    isLoading: simulation.isLoading
  };
}; 