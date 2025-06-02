'use client';

import React, { FC, useState, useEffect } from 'react';
import BotCard from './BotCard';
import SimulationSection from './SimulationSection';
import { useSimulation } from '@/hooks/useSimulation';
import Link from 'next/link';
// Mock wallet adapter for build compatibility
const useWallet = () => ({ connected: false });
import { getBotStatus, setBotStatus, getAllBotStatus, getBotRisk } from '@/lib/botState';

interface BotsSectionClientContentProps {
  connected: boolean;
}

const BotsSectionClientContent: FC<BotsSectionClientContentProps> = ({ connected }) => {
  const [volumeTrackerRisk, setVolumeTrackerRisk] = useState(5);
  const [momentumBotRisk, setMomentumBotRisk] = useState(5);
  const [dipHunterRisk, setDipHunterRisk] = useState(5);
  const [botStatuses, setBotStatuses] = useState(new Map());
  const [useBitquery, setUseBitquery] = useState(true);

  // Echte Simulationen für jeden Bot
  const volumeSimulation = useSimulation('volume-tracker', false, true, useBitquery);
  const trendSimulation = useSimulation('trend-surfer', false, true, useBitquery);
  const dipSimulation = useSimulation('dip-hunter', false, true, useBitquery);

  useEffect(() => {
    setBotStatuses(getAllBotStatus());
    setVolumeTrackerRisk(getBotRisk('volume-tracker'));
    setMomentumBotRisk(getBotRisk('trend-surfer'));
    setDipHunterRisk(getBotRisk('dip-hunter'));

    const statusInterval = setInterval(() => {
      const freshStatuses = getAllBotStatus();
      setBotStatuses(freshStatuses);
      setVolumeTrackerRisk(getBotRisk('volume-tracker'));
      setMomentumBotRisk(getBotRisk('trend-surfer'));
      setDipHunterRisk(getBotRisk('dip-hunter'));
    }, 2000);
    
    return () => clearInterval(statusInterval);
  }, []);

  const handleStatusChange = (id: string, status: 'active' | 'paused') => {
    setBotStatus(id, { isActive: status === 'active' });
    setBotStatuses(getAllBotStatus());
  };

  const toggleDataSource = () => {
    setUseBitquery(!useBitquery);
    // Die useSimulation Hooks werden automatisch mit dem neuen useBitquery Wert neu laden
  };

  // Echte Performance-Daten aus Simulationen extrahieren
  const getSimulationMetrics = (simulation: any) => {
    if (simulation.simulation.isLoading) {
      return {
        weeklyReturn: 'Loading...',
        monthlyReturn: 'Loading...',
        trades: 0,
        winRate: '0%',
        profitToday: 0,
        profitWeek: 0,
        profitMonth: 0
      };
    }

    const { profitPercentage, tradeCount, successRate } = simulation.simulation;
    
    // Berechne realistische Zeitraum-Renditen basierend auf 7-Tage-Simulation
    const weeklyReturn = profitPercentage;
    const monthlyReturn = profitPercentage * 4.3; // ~4.3 Wochen pro Monat
    
    // Berechne Profit-Beträge (basierend auf 1000$ Startkapital)
    const baseCapital = 1000;
    const profitWeekAmount = (weeklyReturn / 100) * baseCapital;
    const profitMonthAmount = (monthlyReturn / 100) * baseCapital;
    const profitTodayAmount = profitWeekAmount / 7; // Täglicher Durchschnitt

    return {
      weeklyReturn: `${weeklyReturn >= 0 ? '+' : ''}${weeklyReturn.toFixed(1)}%`,
      monthlyReturn: `${monthlyReturn >= 0 ? '+' : ''}${monthlyReturn.toFixed(1)}%`,
      trades: tradeCount,
      winRate: `${successRate.toFixed(0)}%`,
      profitToday: Math.max(0, profitTodayAmount),
      profitWeek: Math.max(0, profitWeekAmount),
      profitMonth: Math.max(0, profitMonthAmount)
    };
  };

  const volumeMetrics = getSimulationMetrics(volumeSimulation);
  const trendMetrics = getSimulationMetrics(trendSimulation);
  const dipMetrics = getSimulationMetrics(dipSimulation);

  const bots = [
    {
      id: 'volume-tracker',
      name: 'Volume Tracker',
      description: 'Detektiert plötzliche Volumenspitzen in neu gelisteten Token (<24h) und tradet automatisch bei spezifischen Volumen-Schwellenwerten relativ zur Marktkapitalisierung.',
      ...volumeMetrics,
      strategy: 'Kauft bei spezifischen Volumen-zu-Marktkapitalisierungs-Schwellenwerten in frisch gelisteten Token (unter 24h), vermeidet die ersten 30 Minuten nach Launch. Verkauft mit gestaffelter Gewinnmitnahme bei 70% und vollständigem Ausstieg bei 140% Gewinn, mit einem Stop-Loss bei 35%.',
      riskLevel: 'moderate' as const,
      riskColor: 'text-yellow-400',
      baseRiskPerTrade: volumeTrackerRisk,
      riskManagement: 'Der Bot implementiert automatische Stop-Loss-Mechanismen für jeden Trade mit 35% Verlustbegrenzung. Risiko pro Trade kann von 1-50% des Kapitals angepasst werden.',
      status: (botStatuses.get('volume-tracker')?.isActive ? 'active' : 'paused') as 'active' | 'paused',
      simulation: volumeSimulation
    },
    {
      id: 'trend-surfer',
      name: 'Momentum Bot',
      description: 'Identifiziert explosive Preisbewegungen in neuen Token durch Erkennung aufeinanderfolgender grüner Kerzen mit steigendem Volumen.',
      ...trendMetrics,
      strategy: 'Identifiziert starke Momentum-Signale, einschließlich mindestens 3 aufeinanderfolgender grüner Kerzen und 15%+ Preisanstieg in 15 Minuten mit steigendem Volumen. Tradet nur Token innerhalb der ersten 24 Stunden nach Launch (nach den ersten 30 Minuten) und nutzt gestaffelte Gewinnmitnahme bei 60%, 100% und 140%.',
      riskLevel: 'high' as const,
      riskColor: 'text-red-400',
      baseRiskPerTrade: momentumBotRisk,
      riskManagement: 'Aufgrund der aggressiveren Strategie hat dieser Bot eine höhere Basis-Volatilität mit einem Stop-Loss bei 35%. Risiko pro Trade kann von 1-50% des Kapitals angepasst werden.',
      status: (botStatuses.get('trend-surfer')?.isActive ? 'active' : 'paused') as 'active' | 'paused',
      simulation: trendSimulation
    },
    {
      id: 'dip-hunter',
      name: 'Dip Hunter',
      description: 'Identifiziert signifikante Preisrückgänge (30-60%) in neuen aber stabilen Token und nutzt hochpotenzielle Einstiegsmöglichkeiten.',
      ...dipMetrics,
      strategy: 'Identifiziert optimale Dip-Kauf-Gelegenheiten während 30-60% Preisrückgängen von Allzeithochs, aber nur in Token mit stabiler Liquidität und anhaltendem Handelsvolumen. Tradet ausschließlich innerhalb der ersten 24 Stunden nach Launch, vermeidet die ersten 30 Minuten. Implementiert 50% partielle Gewinnmitnahme bei 60% Gewinn und vollständigen Ausstieg bei 100%.',
      riskLevel: 'low' as const,
      riskColor: 'text-green-400',
      baseRiskPerTrade: dipHunterRisk,
      riskManagement: 'Niedrigste Basis-Volatilität mit einem Stop-Loss von 25%. Maximale Haltezeit von 60 Minuten für reduziertes Risiko. Risiko pro Trade kann von 1-50% des Kapitals angepasst werden.',
      status: (botStatuses.get('dip-hunter')?.isActive ? 'active' : 'paused') as 'active' | 'paused',
      simulation: dipSimulation
    },
  ];

  return (
    <div className="space-y-8">
      {/* Data Source Toggle */}
      <div className="flex justify-center mb-6">
        <button
          onClick={toggleDataSource}
          className="px-6 py-3 bg-gradient-to-r from-primary/20 to-secondary/20 hover:from-primary/30 hover:to-secondary/30 border border-primary/30 rounded-xl transition-all duration-300 text-white font-medium"
        >
          📊 Datenquelle: {useBitquery ? '🌐 Bitquery (Echte Raydium-Daten)' : '🔄 Legacy API'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {bots.map((bot) => (
          <div key={bot.id} className="space-y-4">
            {/* Simulation Chart für jeden Bot */}
            <SimulationSection
              simulation={bot.simulation.simulation}
              error={bot.simulation.error}
              dataSource={useBitquery ? 'real' : 'simulated'}
              onToggleDataSource={() => toggleDataSource()}
            />
            
            {/* Bot Card */}
            <BotCard 
              {...bot}
              onRiskChange={(value) => {
                if (bot.id === 'volume-tracker') setVolumeTrackerRisk(value);
                else if (bot.id === 'trend-surfer') setMomentumBotRisk(value);
                else if (bot.id === 'dip-hunter') setDipHunterRisk(value);
              }}
              riskManagement={`Aktuelles Risiko pro Trade: ${bot.baseRiskPerTrade}% deines Kapitals (Anpassbar über Risiko-Schieberegler)`}
              onStatusChange={handleStatusChange}
              showFavoriteButton={connected}
            />
            
            {/* Token Info */}
            {bot.simulation.simulation.realTokens && bot.simulation.simulation.realTokens.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="text-white font-semibold text-sm mb-2">
                  🎯 Aktuell getradete Token:
                </h4>
                <div className="space-y-2 text-xs">
                  {bot.simulation.simulation.realTokens.slice(0, 3).map((token: any, index: number) => (
                    <div key={index} className="flex justify-between text-white/70">
                      <span>{token.symbol}</span>
                      <span>${(token.marketCap / 1000).toFixed(0)}k MCap</span>
                    </div>
                  ))}
                  {bot.simulation.simulation.realTokens.length > 3 && (
                    <div className="text-primary text-center">
                      +{bot.simulation.simulation.realTokens.length - 3} weitere Token
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const BotsSection: FC = () => {
  const [isClient, setIsClient] = useState(false);
  const wallet = useWallet(); // Call useWallet unconditionally

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return (
    <section id="bots" className="py-20 px-6 bg-dark-light">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
          Unsere <span className="text-primary">Trading Bots</span>
        </h2>
        
        <p className="text-center text-white/80 mb-12 max-w-3xl mx-auto">
          Wähle aus unserer Auswahl an hochperformanten Trading-Bots, jeder mit einer einzigartigen Strategie und Risikoprofil.
          Alle Bots verwenden <span className="text-primary font-semibold">echte Marktdaten</span> von neuen Raydium-Memecoins für realistische Performance-Simulationen.
        </p>
        
        {isClient ? <BotsSectionClientContent connected={wallet.connected} /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Placeholder for non-client render */}
            {[1,2,3].map(i => (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 h-96">
                <div className="flex items-center justify-center h-full">
                  <div className="loading-spinner"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BotsSection; 