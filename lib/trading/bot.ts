import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { PrismaClient, Bot as PrismaBot } from '@prisma/client';
import * as anchor from '@project-serum/anchor';
import { AnchorProvider } from '@project-serum/anchor';
import { VolumeTracker } from '@/bots/VolumeTracker';
import { MomentumBot } from '@/bots/TrendSurfer';
import { DipHunter } from '@/bots/ArbitrageFinder';
import prisma, { getMockModeStatus } from '@/lib/prisma';

// Alchemy RPC URL für Solana Mainnet
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://solana-mainnet.g.alchemy.com/v2/ajXi9mI9_OF6a0Nfy6PZ-05JT29nTxFm';
// Solana Programm-ID für den Trading Bot
const BOT_PROGRAM_ID = process.env.BOT_PROGRAM_ID || 'AaT7QFrQd49Lf2T6UkjrGp7pSW3KvCTQwCLJTPuHUBV9';

const connection = new Connection(SOLANA_RPC_URL, {
  commitment: 'confirmed'
});

// Bot-Programm IDL importieren - mit try-catch um Fehler abzufangen
let idl: any;
try {
  // Versuche verschiedene Pfade für die IDL-Datei
  try {
    idl = require('../../target/idl/trading_bot.json');
  } catch (error) {
    // Fallback für Build-Umgebung
    idl = require('../../../target/idl/trading_bot.json');
  }
} catch (error) {
  console.error('Fehler beim Laden des IDL:', error);
  // Fallback-IDL, falls das echte nicht geladen werden kann
  idl = {
    version: "0.1.0",
    name: "trading_bot",
    instructions: [
      {
        name: "initializeBot",
        accounts: [
          { name: "bot", isMut: true, isSigner: false },
          { name: "user", isMut: true, isSigner: true },
          { name: "systemProgram", isMut: false, isSigner: false }
        ],
        args: [{ name: "botType", type: "string" }]
      },
      {
        name: "activateBot",
        accounts: [
          { name: "bot", isMut: true, isSigner: false },
          { name: "user", isMut: true, isSigner: true }
        ],
        args: []
      },
      {
        name: "deactivateBot",
        accounts: [
          { name: "bot", isMut: true, isSigner: false },
          { name: "user", isMut: true, isSigner: true }
        ],
        args: []
      }
    ]
  };
}

const programId = new PublicKey(BOT_PROGRAM_ID);

// Bot-Instanzen
const botInstances = new Map();

// Speichere die Bot-Status auch über Navigationen hinweg (persistente Speicherung)
let persistentBotStatuses = new Map();

// Speichere die Wallet-Provider für jeden Bot
const walletProviders = new Map();

// Hilfsfunktion zur Synchronisierung des Bot-Status in localStorage
export function initBotStatuses() {
  try {
    if (typeof window !== 'undefined') {
      // Lade bestehende Status aus localStorage
      const savedStatus = localStorage.getItem('botStatuses');
      if (savedStatus) {
        const parsed = JSON.parse(savedStatus);
        Object.entries(parsed).forEach(([botId, isActive]) => {
          persistentBotStatuses.set(botId, isActive);
        });
      }
    }
  } catch (error) {
    console.error('Fehler beim Initialisieren der Bot-Status:', error);
  }
}

// Lade initiale Status
if (typeof window !== 'undefined') {
  initBotStatuses();
}

// Prüfe, ob ein Bot aktiv ist (auch über Navigation hinweg)
export function isBotActive(botId: string): boolean {
  // Synchronisiere mit localStorage
  try {
    if (typeof window !== 'undefined') {
      const savedStatus = localStorage.getItem('botStatuses');
      if (savedStatus) {
        const parsed = JSON.parse(savedStatus);
        if (botId in parsed) {
          // Update lokale Map vom localStorage
          persistentBotStatuses.set(botId, parsed[botId]);
        }
      }
    }
  } catch (e) {
    console.warn('Fehler beim Lesen des Bot-Status aus localStorage:', e);
  }
  
  return persistentBotStatuses.get(botId) === true;
}

// Bot-Status aktualisieren (in der Map und im localStorage)
export function updateBotStatus(botId: string, isActive: boolean) {
  // Setze persistenten Bot-Status
  persistentBotStatuses.set(botId, isActive);
  
  // Speichere in localStorage für Client-seitige Persistenz
  try {
    if (typeof window !== 'undefined') {
      // Aktuelles Status-Objekt aus localStorage lesen
      const currentSavedStatuses = localStorage.getItem('botStatuses');
      const statusObj = currentSavedStatuses ? JSON.parse(currentSavedStatuses) : {};
      
      // Status aktualisieren
      statusObj[botId] = isActive;
      
      // Zurück in localStorage speichern
      localStorage.setItem('botStatuses', JSON.stringify(statusObj));
    }
  } catch (error) {
    console.error('Fehler beim Speichern des Bot-Status:', error);
  }
}

// Bot-Strategie-Typen
export enum BotType {
  VOLUME_TRACKER = 'volume-tracker',
  TREND_SURFER = 'trend-surfer',
  DIP_HUNTER = 'dip-hunter'
}

// Interface für Bot-Konfiguration
export interface BotConfig {
  useNewTokensOnly?: boolean;
  maxTokenAgeHours?: number;
  minMarketCap?: number;
  requireLockedLiquidity?: boolean;
  riskPercentage?: number;
}

// Interface für Default-Bot wenn Datenbank nicht verfügbar ist
interface DefaultBot {
  id: string;
  isActive: boolean;
  walletAddress: string;
  strategyType: string;
  riskPercentage: number;
  name: string;
}

// Initialisiere einen Bot mit der richtigen Strategie und Konfiguration
function createBot(botType: string, provider: AnchorProvider, marketAddress: string, config: BotConfig) {
  const { riskPercentage = 15, useNewTokensOnly = false } = config;
  
  console.log(`Erstelle Bot vom Typ ${botType} mit Risiko ${riskPercentage}% ${useNewTokensOnly ? '(Nur neue Token)' : ''}`);
  
  switch (botType) {
    case BotType.VOLUME_TRACKER:
      const volumeTracker = new VolumeTracker(provider, marketAddress, riskPercentage, useNewTokensOnly);
      // Konfiguriere die Token-Filter wenn notwendig
      if (config.maxTokenAgeHours || config.minMarketCap || config.requireLockedLiquidity !== undefined) {
        volumeTracker.setTokenFilterConfig({
          maxAgeHours: config.maxTokenAgeHours,
          minMarketCap: config.minMarketCap,
          requireLockedLiquidity: config.requireLockedLiquidity,
          useNewTokensOnly
        });
      }
      return volumeTracker;
      
    case BotType.TREND_SURFER:
      const trendSurfer = new MomentumBot(provider, marketAddress, riskPercentage);
      // Implementiere Token-Filter für TrendSurfer wenn entsprechende Methoden vorhanden sind
      return trendSurfer;
      
    case BotType.DIP_HUNTER:
      const dipHunter = new DipHunter(provider, marketAddress, riskPercentage);
      // Implementiere Token-Filter für DipHunter wenn entsprechende Methoden vorhanden sind
      return dipHunter;
      
    default:
      throw new Error(`Unbekannter Bot-Typ: ${botType}`);
  }
}

// Registriere eine Wallet für die Signierung von Transaktionen
export function registerWalletForBot(botId: string, wallet: any) {
  walletProviders.set(botId, wallet);
  console.log(`Wallet für Bot ${botId} registriert`);
}

export async function startTradingBot(botId: string, config: BotConfig = {}) {
  try {
    // Hole Bot-Daten aus der Datenbank
    let bot: PrismaBot | DefaultBot | null = null;
    try {
      bot = await prisma.bot.findUnique({
        where: { id: botId }
      });
    } catch (dbError) {
      console.error('Datenbankfehler beim Starten des Bots:', dbError);
      
      // Verwende Default-Werte, wenn die DB nicht erreichbar ist
      bot = {
        id: botId,
        isActive: true,
        walletAddress: '', // Wird später durch die registrierte Wallet ersetzt
        strategyType: BotType.VOLUME_TRACKER,
        riskPercentage: 5,
        name: 'Default Bot'
      };
    }

    if (!bot || !bot.isActive) {
      throw new Error('Bot nicht aktiv oder nicht gefunden');
    }

    // Prüfe, ob eine Wallet für diesen Bot registriert ist
    const wallet = walletProviders.get(botId);
    if (!wallet) {
      throw new Error(`Keine Wallet für Bot ${botId} registriert`);
    }

    // Erstelle Anchor Provider mit der registrierten Wallet
    const provider = new AnchorProvider(
      connection,
      wallet, // Benutze die registrierte Wallet (mit signTransaction-Methode)
      { commitment: 'confirmed' }
    );

    // Wähle den richtigen Markt basierend auf der Bot-Strategie
    let marketAddress: string;
    switch (bot.strategyType) {
      case BotType.VOLUME_TRACKER:
        marketAddress = '9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT'; // SOL/USDC
        break;
      case BotType.TREND_SURFER:
        marketAddress = 'HWHvQhFmJB3NUcu1aihKmrKegfVxBEHzwVX6yZCKEsi1'; // SOL/USDT
        break;
      case BotType.DIP_HUNTER:
        marketAddress = 'A8YFbxQYFVqKZaoYJLLUVcQiWP7G2MeEgW5wsAQgMvFw'; // BTC/USDC
        break;
      default:
        marketAddress = '9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT'; // Standard: SOL/USDC
    }

    // Erstelle und initialisiere den Bot mit der übergebenen Konfiguration
    const botConfig: BotConfig = {
      riskPercentage: bot.riskPercentage,
      ...config // Übernimm alle weiteren Konfigurationsparameter
    };
    
    // Prüfe, ob bereits eine Instanz existiert, um Doppelstarts zu vermeiden
    if (botInstances.has(botId)) {
      console.log(`Bot ${botId} läuft bereits, keine neue Instanz erstellt`);
    } else {
      const botInstance = createBot(
        bot.strategyType,
        provider,
        marketAddress,
        botConfig
      );
      
      await botInstance.initialize();
      
      // Speichere Bot-Instanz für spätere Referenz
      botInstances.set(botId, botInstance);
  
      console.log(`Bot ${botId} (${bot.strategyType}) gestartet mit Risiko: ${bot.riskPercentage}%`);
      if (config.useNewTokensOnly) {
        console.log(`Modus: Nur neue Token unter ${config.maxTokenAgeHours || 24} Stunden`);
      }
  
      // Markiere den Bot als aktiv im persistenten Speicher
      updateBotStatus(botId, true);
  
      // Starte Trading-Loop nur, wenn noch keiner läuft
      startTradingLoop(botId, bot);
    }

    return {
      botId,
      status: 'active',
      message: `Bot ${bot.name} wurde erfolgreich gestartet`
    };
  } catch (error) {
    console.error(`Fehler beim Starten des Bots ${botId}:`, error);
    throw error;
  }
}

// Separate Funktion für den Trading-Loop, um Duplikate zu vermeiden
function startTradingLoop(botId: string, bot: PrismaBot | DefaultBot) {
  // Eindeutige ID für diesen Trading-Loop, um ihn identifizieren zu können
  const loopId = `trading-loop-${botId}-${Date.now()}`;
  console.log(`Trading Loop ${loopId} gestartet für Bot ${botId}`);
  
  // Starte Trading-Loop
  const intervalId = setInterval(async () => {
    try {
      // Prüfe ob Bot noch aktiv ist
      let isActive = isBotActive(botId);
      
      try {
        const updatedBot = await prisma.bot.findUnique({
          where: { id: botId }
        });
        
        // Update auch den persistenten Status basierend auf der Datenbank
        isActive = updatedBot?.isActive || false;
        updateBotStatus(botId, isActive);
        
      } catch (dbError) {
        console.warn('Datenbankfehler bei Aktivitätsprüfung, verwende Cache:', dbError);
        // Behalte den vorhandenen Status bei, falls wir nicht auf die DB zugreifen können
      }

      if (!isActive) {
        console.log(`Bot ${botId} wurde deaktiviert, stoppe Trading-Loop ${loopId}`);
        clearInterval(intervalId);
        return;
      }

      // Hole Bot-Instanz
      const botInstance = botInstances.get(botId);
      if (!botInstance) {
        console.error(`Bot-Instanz ${botId} nicht gefunden, stoppe Trading-Loop ${loopId}`);
        clearInterval(intervalId);
        updateBotStatus(botId, false);
        return;
      }

      // Stelle sicher, dass bot nicht null ist
      if (!bot) {
        console.error(`Bot ${botId} ist null, überspringe Trading-Iteration`);
        return;
      }

      // Führe Bot-Strategie aus
      let tradeResult;
      switch (bot.strategyType) {
        case BotType.VOLUME_TRACKER:
          tradeResult = await (botInstance as VolumeTracker).checkVolumeAndTrade();
          break;
        case BotType.TREND_SURFER:
          tradeResult = await (botInstance as MomentumBot).checkMomentumAndTrade();
          break;
        case BotType.DIP_HUNTER:
          tradeResult = await (botInstance as DipHunter).findAndTradeDip();
          break;
      }

      // Verarbeite Trade-Ergebnis, wenn vorhanden
      if (tradeResult) {
        try {
          await prisma.trade.create({
            data: {
              botId,
              type: tradeResult.type || 'auto',
              amount: tradeResult.size,
              price: tradeResult.price,
              profit: tradeResult.profit,
              txSignature: tradeResult.signature
            }
          });

          // Aktualisiere Bot-Statistiken
          await prisma.bot.update({
            where: { id: botId },
            data: {
              totalTrades: { increment: 1 },
              successfulTrades: tradeResult.profit > 0 ? { increment: 1 } : undefined,
              totalProfit: { increment: tradeResult.profit }
            }
          });
        } catch (dbError) {
          console.error('Datenbankfehler beim Speichern des Trades:', dbError);
          // Trotzdem den Trade loggen
          console.log(`Bot ${botId} hat einen Trade ausgeführt: ${JSON.stringify(tradeResult)}`);
        }

        console.log(`Bot ${botId} hat einen Trade ausgeführt: ${JSON.stringify(tradeResult)}`);
      }
    } catch (error) {
      console.error(`Fehler beim Trading mit Bot ${botId}:`, error);
    }
  }, 30000); // Prüfe alle 30 Sekunden
}

export async function stopTradingBot(botId: string) {
  const botInstance = botInstances.get(botId);
  
  if (botInstance) {
    botInstances.delete(botId);
    
    // Entferne auch die registrierte Wallet
    walletProviders.delete(botId);
    
    // Setze persistenten Bot-Status
    updateBotStatus(botId, false);
    
    // Aktualisiere Bot-Status in der Datenbank
    try {
      await prisma.bot.update({
        where: { id: botId },
        data: { isActive: false }
      });
    } catch (dbError) {
      console.error('Datenbankfehler beim Stoppen des Bots:', dbError);
    }
    
    return {
      botId,
      status: 'inactive',
      message: `Bot ${botId} wurde erfolgreich gestoppt`
    };
  }
  
  return {
    botId,
    status: 'error',
    message: `Bot ${botId} wurde nicht gefunden oder läuft nicht`
  };
} 