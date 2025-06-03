'use client';

import React, { FC, useState, useEffect } from 'react';
import BotCard from './BotCard';
import SimulationSection from './SimulationSection';
import { useSimulation } from '@/hooks/useSimulation';
import Link from 'next/link';
import { useWallet } from './ClientWalletProvider';
import { getBotStatus, setBotStatus, getAllBotStatus, getBotRisk } from '@/lib/botState';

const BotsSection: FC = () => {
  // Individual risk settings for each bot (1-50%)
  const [volumeTrackerRisk, setVolumeTrackerRisk] = useState(getBotRisk('volume-tracker'));
  const [momentumBotRisk, setMomentumBotRisk] = useState(getBotRisk('trend-surfer'));
  const [dipHunterRisk, setDipHunterRisk] = useState(getBotRisk('dip-hunter'));
  
  // Bot-Status aus localStorage
  const [botStatuses, setBotStatuses] = useState(getAllBotStatus());
  
  const { connected } = useWallet();

  // Echte Bitquery Simulationen für jeden Bot - 7 Tage echte Daten
  const volumeSimulation = useSimulation('volume-tracker', false, true, true); // useBitquery = true
  const trendSimulation = useSimulation('trend-surfer', false, true, true);
  const dipSimulation = useSimulation('dip-hunter', false, true, true);

  // Regelmäßig den Status aus localStorage abrufen
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
  
  // Handle bot status change
  const handleStatusChange = (id: string, status: 'active' | 'paused') => {
    setBotStatus(id, { isActive: status === 'active' });
    setBotStatuses(getAllBotStatus());
  };

  // Echte Performance-Daten aus Bitquery Simulationen extrahieren
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
      description: 'Detektiert plötzliche Volumenspitzen in neu gelisteten Token (<24h) und tradet automatisch bei spezifischen Volumen-Schwellenwerten.',
      ...volumeMetrics,
      strategy: 'Kauft bei spezifischen Volumen-zu-Marktkapitalisierungs-Schwellenwerten in frisch gelisteten Token (unter 24h). Verkauft mit gestaffelter Gewinnmitnahme bei 70% und vollständigem Ausstieg bei 140% Gewinn, mit Stop-Loss bei 35%.',
      riskLevel: 'moderate' as const,
      riskColor: 'text-yellow-400',
      baseRiskPerTrade: volumeTrackerRisk,
      riskManagement: 'Automatische Stop-Loss-Mechanismen mit 35% Verlustbegrenzung. Risiko pro Trade anpassbar von 1-50% des Kapitals.',
      status: (botStatuses.get('volume-tracker')?.isActive ? 'active' : 'paused') as 'active' | 'paused',
      simulation: volumeSimulation
    },
    {
      id: 'trend-surfer',
      name: 'Momentum Bot',
      description: 'Identifiziert explosive Preisbewegungen in neuen Token durch Erkennung aufeinanderfolgender grüner Kerzen mit steigendem Volumen.',
      ...trendMetrics,
      strategy: 'Identifiziert starke Momentum-Signale mit mindestens 3 aufeinanderfolgenden grünen Kerzen und 15%+ Preisanstieg in 15 Minuten. Nutzt gestaffelte Gewinnmitnahme bei 60%, 100% und 140%.',
      riskLevel: 'high' as const,
      riskColor: 'text-red-400',
      baseRiskPerTrade: momentumBotRisk,
      riskManagement: 'Höhere Basis-Volatilität mit Stop-Loss bei 35%. Risiko pro Trade anpassbar von 1-50% des Kapitals.',
      status: (botStatuses.get('trend-surfer')?.isActive ? 'active' : 'paused') as 'active' | 'paused',
      simulation: trendSimulation
    },
    {
      id: 'dip-hunter',
      name: 'Dip Hunter',
      description: 'Identifiziert signifikante Preisrückgänge (30-60%) in neuen aber stabilen Token und nutzt hochpotenzielle Einstiegsmöglichkeiten.',
      ...dipMetrics,
      strategy: 'Identifiziert optimale Dip-Kauf-Gelegenheiten während 30-60% Preisrückgängen von Allzeithochs. Implementiert 50% partielle Gewinnmitnahme bei 60% und vollständigen Ausstieg bei 100%.',
      riskLevel: 'low' as const,
      riskColor: 'text-green-400',
      baseRiskPerTrade: dipHunterRisk,
      riskManagement: 'Niedrigste Basis-Volatilität mit Stop-Loss von 25%. Maximale Haltezeit von 60 Minuten für reduziertes Risiko.',
      status: (botStatuses.get('dip-hunter')?.isActive ? 'active' : 'paused') as 'active' | 'paused',
      simulation: dipSimulation
    },
  ];

  return (
    <section id="bots" className="py-20 px-6 bg-dark-light">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
          Unsere <span className="text-primary">Trading Bots</span>
        </h2>
        
        <p className="text-center text-white/80 mb-12 max-w-3xl mx-auto">
          Wähle aus unserer Auswahl an hochperformanten Trading-Bots, jeder mit einer einzigartigen Strategie und Risikoprofil.
          Alle Performance-Daten basieren auf <span className="text-primary font-semibold">echten 7-Tage-Simulationen</span> mit neuen Raydium-Memecoins über die Bitquery API.
        </p>

        {/* Bitquery Status */}
        <div className="flex justify-center mb-8">
          <div className="px-6 py-3 bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-xl text-white font-medium">
            🌐 Live Daten: Bitquery API (Echte Raydium-Transaktionen)
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bots.map((bot) => (
            <div key={bot.id} className="space-y-4">
              {/* Echte Simulation Chart für jeden Bot */}
              <SimulationSection
                simulation={bot.simulation.simulation}
                error={bot.simulation.error}
                dataSource="real"
                onToggleDataSource={() => {}} // Kein Toggle mehr - nur echte Daten
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
              
              {/* Echte Token Info aus Bitquery */}
              {bot.simulation.simulation.realTokens && bot.simulation.simulation.realTokens.length > 0 && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h4 className="text-white font-semibold text-sm mb-2">
                    🎯 Aktuell simulierte Token (Letzte 7 Tage):
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
                        +{bot.simulation.simulation.realTokens.length - 3} weitere Token aus echten Raydium-Daten
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BotsSection; 