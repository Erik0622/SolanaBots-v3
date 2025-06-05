import type { NextApiRequest, NextApiResponse } from 'next';
import { RealTokenSimulator } from '../../lib/simulation/realTokenSimulator';
import { BitqueryAPI, BitqueryToken } from '../../lib/apis/bitqueryAPI';

interface BitquerySimulationResult {
  profitPercentage: number;
  tradeCount: number;
  successRate: number;
  dailyData: { date: string; value: number }[];
  tokens: BitqueryToken[];
  dataSource: 'bitquery-api';
  debugLogs: string[];
}

export const config = {
  api: {
    responseLimit: false,
    maxDuration: 60, // 60 Sekunden für Pro Plan (statt 10s default)
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { botType, tokenCount = 10, useBitquery = true } = req.body;

    if (!botType) {
      return res.status(400).json({ message: 'Bot type is required' });
    }

    console.log(`🚀 Starting ${useBitquery ? 'Bitquery' : 'Legacy'} simulation for bot: ${botType}`);

    if (useBitquery) {
      // NEUE BITQUERY SIMULATION mit Timeout-Optimierung
      const result = await simulateWithBitqueryData(botType, tokenCount);
      return res.status(200).json(result);
    } else {
      // LEGACY SIMULATION
      const simulator = new RealTokenSimulator();
      const result = await simulator.simulateWithRealData(botType, tokenCount);
      return res.status(200).json(result);
    }

  } catch (error) {
    console.error('❌ Simulation API Error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// GLOBALER DEBUG-LOG COLLECTOR
let debugLogs: string[] = [];

function addDebugLog(message: string) {
  const timestamp = new Date().toLocaleTimeString();
  const logMessage = `[${timestamp}] ${message}`;
  debugLogs.push(logMessage);
  console.log(logMessage);
}

function clearDebugLogs() {
  debugLogs = [];
}

function getDebugLogs(): string[] {
  return [...debugLogs];
}

/**
 * NEUE 7-TAGE TAGESWEISE SIMULATION
 * Jeden Tag neue Token-Auswahl basierend auf aktuellen Kriterien
 */
async function simulateWithBitqueryData(
  botType: string, 
  tokenCount: number
): Promise<BitquerySimulationResult> {
  
  clearDebugLogs(); // Reset debug logs
  addDebugLog('🔍 Starting 7-day progressive simulation...');
  
  try {
    const bitqueryAPI = new BitqueryAPI();
    
    // COMPREHENSIVE API DEBUG TEST
    addDebugLog('🔧 === COMPREHENSIVE BITQUERY API DEBUG ===');
    await bitqueryAPI.debugAPIConfig();
    
    // Test verschiedene Blockchain-APIs
    addDebugLog('🔍 === TESTING VARIOUS BLOCKCHAIN APIS ===');
    await bitqueryAPI.testBlockchainAPIs();
    
    // Test API Connection
    addDebugLog('🧪 Testing Bitquery API connection...');
    const schemaWorking = await bitqueryAPI.testConnection();
    if (!schemaWorking) {
      addDebugLog('❌ Bitquery API Schema-Test fehlgeschlagen');
      throw new Error('Bitquery API Schema-Test fehlgeschlagen');
    }
    addDebugLog('✅ Bitquery API connection successful');
    
    // RUN 7-DAY PROGRESSIVE SIMULATION
    const simulationResult = await runSevenDayProgressiveSimulation(bitqueryAPI, botType, tokenCount);
    
    return {
      ...simulationResult,
      dataSource: 'bitquery-api',
      debugLogs: getDebugLogs()
    };
    
  } catch (error) {
    addDebugLog(`❌ Simulation failed: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    console.error('❌ Simulation failed:', error);
    throw new Error(`Simulation Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
  }
}

/**
 * ECHTE 7-TAGE PROGRESSIVE SIMULATION mit PERFORMANCE-OPTIMIERUNG
 * Vollständige API-Nutzung, aber parallelisiert und timeout-optimiert
 */
async function runSevenDayProgressiveSimulation(
  bitqueryAPI: BitqueryAPI,
  botType: string,
  maxTokensPerDay: number
): Promise<{
  profitPercentage: number;
  tradeCount: number;
  successRate: number;
  dailyData: { date: string; value: number }[];
  tokens: BitqueryToken[];
  debugLogs: string[];
}> {
  
  const startingCapital = 1000; // $1000 Startkapital
  let currentCapital = startingCapital;
  let totalTrades = 0;
  let successfulTrades = 0;
  
  const dailyResults: { date: string; value: number }[] = [];
  const allTokensUsed: BitqueryToken[] = [];
  
  // Portfolio-Tracking für offene Positionen
  const openPositions = new Map<string, {
    tokenAddress: string;
    amount: number;
    entryPrice: number;
    entryTime: number;
    stopLoss: number;
    takeProfit: number;
  }>();
  
  // SIMULATION: 7 Tage rückblickend
  const simulationEndDate = new Date();
  const simulationStartDate = new Date(simulationEndDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  addDebugLog(`🎯 === ECHTE 7-DAY PROGRESSIVE SIMULATION START ===`);
  addDebugLog(`Bot Type: ${botType}`);
  addDebugLog(`Max Tokens per Day: ${maxTokensPerDay}`);
  addDebugLog(`Starting Capital: $${startingCapital}`);
  addDebugLog(`Simulation Period: ${simulationStartDate.toISOString().split('T')[0]} bis ${simulationEndDate.toISOString().split('T')[0]}`);
  
  // QUICK TEST: Teste BitqueryAPI direkt
  try {
    addDebugLog(`🧪 === TESTING BITQUERY API DIRECTLY ===`);
    const testDate = new Date(simulationStartDate.getTime() + 3 * 24 * 60 * 60 * 1000); // Tag 4
    addDebugLog(`Testing token selection for: ${testDate.toISOString().split('T')[0]}`);
    
    const testTokens = await bitqueryAPI.getTokensEligibleAtDate(testDate, {
      maxAgeHours: 24,
      minMarketCap: 50000,
      migratedToRaydium: true
    });
    
    addDebugLog(`🔍 API Test Result: ${testTokens.length} tokens found`);
    if (testTokens.length > 0) {
      addDebugLog(`✅ First token: ${testTokens[0].symbol} (${testTokens[0].address.slice(0, 8)}...)`);
      addDebugLog(`   MCap: $${testTokens[0].marketCap.toLocaleString()}, Vol: $${testTokens[0].volume24h.toLocaleString()}`);
      
      // Test history loading
      const testHistory = await bitqueryAPI.getTokenDayHistory(testTokens[0].address, testDate);
      addDebugLog(`📊 History Test: ${testHistory.length} candles loaded for ${testTokens[0].symbol}`);
    } else {
      addDebugLog(`❌ NO TOKENS FOUND - This is the problem!`);
      
      // Fall back to standard API to check if any tokens exist
      addDebugLog(`🔄 Testing standard API...`);
      const standardTokens = await bitqueryAPI.getNewRaydiumMemecoins(5);
      addDebugLog(`📊 Standard API Result: ${standardTokens.length} tokens`);
      
      if (standardTokens.length === 0) {
        addDebugLog(`❌ EVEN STANDARD API HAS NO TOKENS - BitqueryAPI Problem!`);
        throw new Error('Bitquery API returns no tokens - possible API issue');
      }
    }
  } catch (testError) {
    addDebugLog(`❌ BITQUERY API TEST FAILED: ${testError instanceof Error ? testError.message : 'Unknown error'}`);
    throw new Error(`Bitquery API test failed: ${testError instanceof Error ? testError.message : 'Unknown error'}`);
  }
  
  addDebugLog(`📅 === STARTING DAY-BY-DAY SIMULATION ===`);
  
  // SCHRITT 1: ALLE TOKEN-ABFRAGEN PARALLEL STARTEN (aber begrenzt für Stabilität)
  addDebugLog(`⚡ PERFORMANCE BOOST: Starting controlled parallel token collection for all 7 days...`);
  
  // CHUNKED PROCESSING: Nur 3 Tage parallel (statt 7) für bessere Stabilität
  const chunks: number[][] = [
    [0, 1, 2], // Tag 1-3
    [3, 4],    // Tag 4-5  
    [5, 6]     // Tag 6-7
  ];
  
  const allDayResults: Array<{
    day: number;
    date: string;
    tokens: BitqueryToken[];
    histories: Map<string, any[]>;
  }> = [];
  
  // Verarbeite Chunks sequenziell, aber innerhalb chunk parallel
  for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
    const chunk = chunks[chunkIndex];
    addDebugLog(`📦 Processing chunk ${chunkIndex + 1}/${chunks.length}: Days ${chunk.map(d => d + 1).join(', ')}`);
    
    const chunkPromises = chunk.map(day => {
      const currentDate = new Date(simulationStartDate.getTime() + day * 24 * 60 * 60 * 1000);
      const dateString = currentDate.toISOString().split('T')[0];
      
      return (async () => {
        addDebugLog(`🔍 Day ${day + 1}: Collecting tokens for ${dateString}...`);
        
        try {
          const dayTokens = await getEligibleTokensForDate(bitqueryAPI, currentDate, maxTokensPerDay);
          addDebugLog(`🎯 Day ${day + 1}: ${dayTokens.length} tokens found`);
          
          if (dayTokens.length === 0) {
            addDebugLog(`⚠️ Day ${day + 1}: No tokens - skipping history collection`);
            return {
              day,
              date: dateString,
              tokens: [],
              histories: new Map<string, any[]>()
            };
          }
          
          // Load histories für diese Token
          const tokenHistories = await loadTokenHistoriesForDate(bitqueryAPI, dayTokens, currentDate);
          addDebugLog(`📊 Day ${day + 1}: Loaded histories for ${tokenHistories.size} tokens`);
          
          return {
            day,
            date: dateString,
            tokens: dayTokens,
            histories: tokenHistories
          };
        } catch (dayError) {
          addDebugLog(`❌ Day ${day + 1} failed: ${dayError instanceof Error ? dayError.message : 'Unknown error'}`);
          return {
            day,
            date: dateString,
            tokens: [],
            histories: new Map<string, any[]>()
          };
        }
      })();
    });
    
    // Warte auf diesen Chunk (mit Timeout)
    try {
      const chunkResults = await Promise.race([
        Promise.all(chunkPromises),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error(`Chunk ${chunkIndex + 1} timeout after 20s`)), 20000)
        )
      ]);
      
      allDayResults.push(...chunkResults);
      addDebugLog(`✅ Chunk ${chunkIndex + 1} complete: ${chunkResults.length} days processed`);
    } catch (chunkError) {
      addDebugLog(`❌ Chunk ${chunkIndex + 1} failed: ${chunkError instanceof Error ? chunkError.message : 'Unknown error'}`);
      
      // Bei Chunk-Fehler: Füge leere Ergebnisse hinzu statt zu scheitern
      chunk.forEach(day => {
        const currentDate = new Date(simulationStartDate.getTime() + day * 24 * 60 * 60 * 1000);
        const dateString = currentDate.toISOString().split('T')[0];
        allDayResults.push({
          day,
          date: dateString,
          tokens: [],
          histories: new Map<string, any[]>()
        });
      });
    }
  }
  
  addDebugLog(`✅ CHUNKED COLLECTION COMPLETE: All 7 days processed in ${chunks.length} chunks`);
  
  // SCHRITT 3: SEQUENTIELLE TRADING-SIMULATION (weniger timeout-kritisch)
  addDebugLog(`🎯 === STARTING SEQUENTIAL TRADING SIMULATION ===`);
  
  for (const dayData of allDayResults) {
    const { day, date, tokens: dayTokens, histories: tokenHistories } = dayData;
    
    addDebugLog(`📅 === SIMULATION TAG ${day + 1}: ${date} ===`);
    addDebugLog(`💰 Portfolio Wert zu Tagesbeginn: $${currentCapital.toFixed(2)}`);
    addDebugLog(`🎯 ${dayTokens.length} Token verfügbar für Trading`);
    
    if (dayTokens.length === 0) {
      addDebugLog(`⚠️ Keine Token verfügbar für Tag ${day + 1} - SKIPPE TAG`);
      dailyResults.push({
        date,
        value: ((currentCapital - startingCapital) / startingCapital) * 100
      });
      continue;
    }
    
    // DEBUG: Token Details
    dayTokens.forEach((token, index) => {
      addDebugLog(`📋 Token ${index + 1}: ${token.symbol} (${token.address.slice(0, 8)}...)`);
      addDebugLog(`   MCap: $${token.marketCap.toLocaleString()}, Vol: $${token.volume24h.toLocaleString()}, Age: ${token.age.toFixed(1)}h`);
    });
    
    addDebugLog(`📊 Loaded histories for ${tokenHistories.size} tokens`);
    
    // DEBUG: History Details
    for (const [address, history] of tokenHistories.entries()) {
      const token = dayTokens.find(t => t.address === address);
      addDebugLog(`📈 ${token?.symbol || 'UNKNOWN'}: ${history.length} candles loaded`);
      if (history.length > 0) {
        addDebugLog(`   First candle: $${history[0].close.toFixed(6)} at ${new Date(history[0].timestamp).toLocaleTimeString()}`);
        addDebugLog(`   Last candle: $${history[history.length - 1].close.toFixed(6)} at ${new Date(history[history.length - 1].timestamp).toLocaleTimeString()}`);
      }
    }
    
    if (tokenHistories.size === 0) {
      addDebugLog(`❌ Keine Preishistorien für Tag ${day + 1} - SKIPPE TAG`);
      dailyResults.push({
        date,
        value: ((currentCapital - startingCapital) / startingCapital) * 100
      });
      continue;
    }
    
    // TRADING-SIMULATION für diesen Tag
    addDebugLog(`🔍 STEP 3: Running trading simulation with ${botType} strategy...`);
    const tradingResult = await simulateTradingDay(
      botType,
      dayTokens,
      tokenHistories,
      currentCapital,
      openPositions,
      new Date(date)
    );
    
    addDebugLog(`📊 STEP 3 RESULT: ${tradingResult.tradesExecuted} trades executed, ${tradingResult.successfulTrades} successful`);
    
    // Portfolio aktualisieren
    currentCapital = tradingResult.endingCapital;
    totalTrades += tradingResult.tradesExecuted;
    successfulTrades += tradingResult.successfulTrades;
    allTokensUsed.push(...dayTokens);
    
    // Tagesperformance speichern
    const dailyReturn = ((tradingResult.endingCapital - startingCapital) / startingCapital) * 100;
    dailyResults.push({
      date,
      value: dailyReturn
    });
    
    addDebugLog(`📊 Tag ${day + 1} Ergebnis:`);
    addDebugLog(`   Trades: ${tradingResult.tradesExecuted} (${tradingResult.successfulTrades} erfolgreich)`);
    addDebugLog(`   Portfolio Ende: $${tradingResult.endingCapital.toFixed(2)}`);
    addDebugLog(`   Offene Positionen: ${openPositions.size}`);
  }
  
  // FINALE ERGEBNISSE
  const finalReturn = ((currentCapital - startingCapital) / startingCapital) * 100;
  const successRate = totalTrades > 0 ? (successfulTrades / totalTrades) * 100 : 0;
  
  addDebugLog(`🏁 === SIMULATION COMPLETE ===`);
  addDebugLog(`   Final Portfolio: $${currentCapital.toFixed(2)}`);
  addDebugLog(`   Total Return: ${finalReturn.toFixed(2)}%`);
  addDebugLog(`   Total Trades: ${totalTrades} (${successfulTrades} successful)`);
  addDebugLog(`   Success Rate: ${successRate.toFixed(1)}%`);
  addDebugLog(`   Tokens Used: ${allTokensUsed.length} unique tokens`);
  
  return {
    profitPercentage: finalReturn,
    tradeCount: totalTrades,
    successRate,
    dailyData: dailyResults,
    tokens: allTokensUsed,
    debugLogs: getDebugLogs()
  };
}

/**
 * Lädt Token die an einem bestimmten Tag die Kriterien erfüllten
 */
async function getEligibleTokensForDate(
  bitqueryAPI: BitqueryAPI,
  targetDate: Date,
  maxTokens: number
): Promise<BitqueryToken[]> {
  
  try {
    // Token die AN DIESEM TAG:
    // - < 24h alt waren
    // - > 50k Market Cap hatten  
    // - zu Raydium migriert waren
    const tokens = await bitqueryAPI.getTokensEligibleAtDate(targetDate, {
      maxAgeHours: 24,
      minMarketCap: 50000,
      migratedToRaydium: true
    });
    
    // Bewerte und sortiere Token für Bot-Strategie
    const scoredTokens = tokens
      .map(token => ({ token, score: calculateTokenScore(token, 'volume-tracker') }))
      .sort((a, b) => b.score - a.score)
      .slice(0, maxTokens)
      .map(item => item.token);
    
    return scoredTokens;
    
  } catch (error) {
    console.error(`❌ Token-Auswahl für ${targetDate.toISOString().split('T')[0]} fehlgeschlagen:`, error);
    return [];
  }
}

/**
 * Lädt echte Preishistorie für Token an einem bestimmten Tag
 */
async function loadTokenHistoriesForDate(
  bitqueryAPI: BitqueryAPI,
  tokens: BitqueryToken[],
  targetDate: Date
): Promise<Map<string, any[]>> {
  
  const histories = new Map<string, any[]>();
  
  for (const token of tokens) {
    try {
      // Lade 24h OHLCV-Daten für diesen Tag
      const history = await bitqueryAPI.getTokenDayHistory(token.address, targetDate);
      
      if (history && history.length > 0) {
        histories.set(token.address, history);
        console.log(`📊 ${token.symbol}: ${history.length} Kerzen geladen`);
      }
    } catch (error) {
      console.error(`❌ Historie für ${token.symbol} fehlgeschlagen:`, error);
    }
  }
  
  return histories;
}

/**
 * ECHTE BOT-STRATEGIEN (aus botSimulator.ts)
 * Verwendet echte Bitquery OHLCV-Daten statt vereinfachte Signale
 */
function getBotSignal(
  botType: string, 
  token: BitqueryToken, 
  candle: any, 
  history: any[],
  currentIndex: number
): 'BUY' | 'SELL' | 'HOLD' {
  
  // Konvertiere Bitquery-Format zu Standard OHLCV-Format
  const data = history.map(h => ({
    timestamp: h.timestamp,
    open: h.open,
    high: h.high,
    low: h.low,
    close: h.close,
    volume: h.volume
  }));
  
  // Füge aktuelle Kerze hinzu
  data.push({
    timestamp: candle.timestamp,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    volume: candle.volume
  });
  
  const index = data.length - 1;
  
  switch (botType) {
    case 'volume-tracker':
      return getVolumeTrackerSignal(data, index);
    case 'trend-surfer':
      return getTrendSurferSignal(data, index);
    case 'dip-hunter':
      return getDipHunterSignal(data, index);
    default:
      return 'HOLD';
  }
}

/**
 * VOLUME-TRACKER STRATEGIE (exakt aus botSimulator.ts)
 */
function getVolumeTrackerSignal(data: any[], index: number): 'BUY' | 'SELL' | 'HOLD' {
  console.log(`\n🔍 Volume-Tracker Check: Index ${index}, Data length: ${data.length}`);
  
  if (index < 5) {
    console.log(`❌ Volume-Tracker: Not enough data (${index} < 5)`);
    return 'HOLD';
  }

  const relevantData = data.slice(index - 5, index + 1);
  const averageVolume = relevantData.slice(0, 5).reduce((sum, d) => sum + d.volume, 0) / 5;
  const currentVolume = relevantData[5].volume;
  const currentClose = relevantData[5].close;
  const prevClose = relevantData[4].close;

  const volumeCondition = currentVolume > averageVolume * 1.5;
  const priceCondition = currentClose >= prevClose;
  
  console.log(`📊 Volume-Tracker Analysis:`);
  console.log(`   Avg Volume (5 periods): ${averageVolume.toFixed(2)}`);
  console.log(`   Current Volume: ${currentVolume.toFixed(2)}`);
  console.log(`   Volume threshold (1.5x): ${(averageVolume * 1.5).toFixed(2)}`);
  console.log(`   Volume condition: ${volumeCondition} (${currentVolume.toFixed(2)} > ${(averageVolume * 1.5).toFixed(2)})`);
  console.log(`   Prev Close: $${prevClose.toFixed(6)}, Current Close: $${currentClose.toFixed(6)}`);
  console.log(`   Price condition: ${priceCondition} (${currentClose.toFixed(6)} >= ${prevClose.toFixed(6)})`);
  
  const signal = (volumeCondition && priceCondition) ? 'BUY' : 'HOLD';
  console.log(`   FINAL SIGNAL: ${signal}`);
  
  return signal;
}

/**
 * TREND-SURFER STRATEGIE (exakt aus botSimulator.ts)
 */
function getTrendSurferSignal(data: any[], index: number): 'BUY' | 'SELL' | 'HOLD' {
  console.log(`\n🔍 Trend-Surfer Check: Index ${index}, Data length: ${data.length}`);
  
  if (index < 10) {
    console.log(`❌ Trend-Surfer: Not enough data (${index} < 10)`);
    return 'HOLD';
  }

  const recent = data.slice(index - 9, index + 1);
  const prices = recent.map(d => d.close);
  const sma5 = prices.slice(-5).reduce((sum, p) => sum + p, 0) / 5;
  const sma10 = prices.reduce((sum, p) => sum + p, 0) / 10;
  const currentPrice = prices[prices.length - 1];
  const priceChange = (currentPrice - prices[0]) / prices[0];

  const trendCondition = sma5 > sma10;
  const momentumCondition = priceChange > 0.02; // 2% Momentum
  
  console.log(`📊 Trend-Surfer Analysis:`);
  console.log(`   SMA5: $${sma5.toFixed(6)}, SMA10: $${sma10.toFixed(6)}`);
  console.log(`   Trend condition: ${trendCondition} (SMA5 > SMA10)`);
  console.log(`   Price change (10 periods): ${(priceChange * 100).toFixed(2)}%`);
  console.log(`   Momentum condition: ${momentumCondition} (>2%)`);
  
  const signal = (trendCondition && momentumCondition) ? 'BUY' : 'HOLD';
  console.log(`   FINAL SIGNAL: ${signal}`);
  
  return signal;
}

/**
 * DIP-HUNTER STRATEGIE (exakt aus botSimulator.ts)
 */
function getDipHunterSignal(data: any[], index: number): 'BUY' | 'SELL' | 'HOLD' {
  console.log(`\n🔍 Dip-Hunter Check: Index ${index}, Data length: ${data.length}`);
  
  if (index < 10) {
    console.log(`❌ Dip-Hunter: Not enough data (${index} < 10)`);
    return 'HOLD';
  }

  const recent = data.slice(index - 9, index + 1);
  const currentPrice = recent[recent.length - 1].close;
  const maxPrice = Math.max(...recent.map(d => d.high));
  const dropPercent = (maxPrice - currentPrice) / maxPrice;
  const volumeSpike = recent[recent.length - 1].volume > (recent.slice(0, -1).reduce((sum, d) => sum + d.volume, 0) / 9) * 1.5;

  const dipCondition = dropPercent > 0.15; // 15% Dip
  const volumeCondition = volumeSpike;
  
  console.log(`📊 Dip-Hunter Analysis:`);
  console.log(`   Current Price: $${currentPrice.toFixed(6)}`);
  console.log(`   Max Price (10 periods): $${maxPrice.toFixed(6)}`);
  console.log(`   Drop: ${(dropPercent * 100).toFixed(2)}%`);
  console.log(`   Dip condition: ${dipCondition} (>15%)`);
  console.log(`   Volume spike: ${volumeCondition}`);
  
  const signal = (dipCondition && volumeCondition) ? 'BUY' : 'HOLD';
  console.log(`   FINAL SIGNAL: ${signal}`);
  
  return signal;
}

/**
 * VERKAUFS-LOGIK mit korrekten Profit/Loss-Levels
 * ANGEPASST: 200% Take-Profit, 35% Stop-Loss
 */
function shouldSellPosition(
  botType: string,
  data: any[],
  currentIndex: number,
  entryPrice: number,
  entryIndex: number
): boolean {
  
  if (currentIndex === 0) return false;
  
  const currentPrice = data[currentIndex].close;
  const holdingPeriods = currentIndex - entryIndex;
  
  // UNIVERSELLE PROFIT/LOSS-LEVELS (wie gewünscht)
  const takeProfit = entryPrice * 3.0; // 200% Gewinn = 3x Preis
  const stopLoss = entryPrice * 0.65; // 35% Verlust = 0.65x Preis
  
  // Take-Profit bei 200% Gewinn
  if (currentPrice >= takeProfit) {
    console.log(`💰 TAKE-PROFIT: ${currentPrice.toFixed(6)} >= ${takeProfit.toFixed(6)} (200% gain)`);
    return true;
  }
  
  // Stop-Loss bei 35% Verlust
  if (currentPrice <= stopLoss) {
    console.log(`🛑 STOP-LOSS: ${currentPrice.toFixed(6)} <= ${stopLoss.toFixed(6)} (35% loss)`);
    return true;
  }
  
  // Bot-spezifische Zusatz-Regeln
  switch (botType) {
    case 'volume-tracker':
      // Nach 48 Perioden (12 Stunden) verkaufen
      if (holdingPeriods >= 48) {
        console.log(`⏰ TIME-EXIT (Volume-Tracker): ${holdingPeriods} periods`);
        return true;
      }
      break;
      
    case 'trend-surfer':
      // Trendumkehr - wenn eine rote Kerze auftritt (aber nur bei Gewinn)
      const trendReversal = data[currentIndex].close < data[currentIndex].open;
      if (trendReversal && currentPrice > entryPrice) {
        console.log(`📉 TREND-REVERSAL: Red candle at profit`);
        return true;
      }
      break;
      
    case 'dip-hunter':
      // Maximale Haltezeit: 4 Perioden (1 Stunde)
      if (holdingPeriods >= 4) {
        console.log(`⏰ TIME-EXIT (Dip-Hunter): ${holdingPeriods} periods`);
        return true;
      }
      break;
  }
  
  return false;
}

/**
 * VERBESSERTE Trading-Simulation mit korrekten Profit/Loss-Levels
 */
async function simulateTradingDay(
  botType: string,
  tokens: BitqueryToken[],
  histories: Map<string, any[]>,
  startingCapital: number,
  openPositions: Map<string, any>,
  tradingDate: Date
): Promise<{
  endingCapital: number;
  tradesExecuted: number;
  successfulTrades: number;
}> {
  
  console.log(`\n🎯 === TRADING DAY SIMULATION START ===`);
  console.log(`Strategy: ${botType}, Starting Capital: $${startingCapital.toFixed(2)}`);
  console.log(`Tokens available: ${tokens.length}, Histories: ${histories.size}`);
  console.log(`Open positions: ${openPositions.size}`);
  
  let currentCapital = startingCapital;
  let tradesExecuted = 0;
  let successfulTrades = 0;
  
  // Sammle alle Kerzen chronologisch
  const allCandles: Array<{
    tokenAddress: string;
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    candleIndex: number; // Index in der Token-Historie
  }> = [];
  
  // Sammle alle Kerzen von allen Token mit Index-Tracking
  tokens.forEach(token => {
    const history = histories.get(token.address);
    if (history && history.length > 0) {
      history.forEach((candle, index) => {
        allCandles.push({
          tokenAddress: token.address,
          candleIndex: index,
          ...candle
        });
      });
      console.log(`📊 Token ${token.symbol}: Added ${history.length} candles to simulation`);
    } else {
      console.log(`❌ Token ${token.symbol}: NO CANDLES AVAILABLE`);
    }
  });
  
  // Sortiere chronologisch
  allCandles.sort((a, b) => a.timestamp - b.timestamp);
  
  console.log(`📊 Processing ${allCandles.length} total candles for trading simulation`);
  
  if (allCandles.length === 0) {
    console.log(`❌ NO CANDLES TO PROCESS - ENDING SIMULATION`);
    return {
      endingCapital: currentCapital,
      tradesExecuted: 0,
      successfulTrades: 0
    };
  }
  
  // Trading-Simulation über alle Kerzen
  for (let i = 0; i < allCandles.length; i++) {
    const candle = allCandles[i];
    const token = tokens.find(t => t.address === candle.tokenAddress);
    if (!token) {
      console.log(`❌ Token not found for address ${candle.tokenAddress.slice(0, 8)}...`);
      continue;
    }
    
    const tokenHistory = histories.get(token.address) || [];
    const currentPosition = openPositions.get(token.address);
    
    console.log(`\n🔍 Processing candle ${i + 1}/${allCandles.length}: ${token.symbol} at $${candle.close.toFixed(6)}`);
    console.log(`   Time: ${new Date(candle.timestamp).toLocaleTimeString()}, Index: ${candle.candleIndex}`);
    console.log(`   Current position: ${currentPosition ? 'YES' : 'NO'}`);
    
    // VERKAUFS-LOGIK prüfen (zuerst)
    if (currentPosition) {
      console.log(`🔍 SELL CHECK: Position exists - Entry: $${currentPosition.entryPrice.toFixed(6)}`);
      
      const shouldSell = shouldSellPosition(
        botType,
        tokenHistory,
        candle.candleIndex,
        currentPosition.entryPrice,
        currentPosition.entryIndex
      );
      
      // KORREKTE PROFIT/LOSS-LEVELS: 200% Take-Profit, 35% Stop-Loss
      const takeProfit = currentPosition.entryPrice * 3.0; // 200% = 3x
      const stopLoss = currentPosition.entryPrice * 0.65; // 35% loss = 0.65x
      
      console.log(`   Take Profit: $${takeProfit.toFixed(6)}, Stop Loss: $${stopLoss.toFixed(6)}`);
      console.log(`   Should sell (strategy): ${shouldSell}`);
      console.log(`   Hit stop loss: ${candle.close <= stopLoss}`);
      console.log(`   Hit take profit: ${candle.close >= takeProfit}`);
      
      if (shouldSell || candle.close <= stopLoss || candle.close >= takeProfit) {
        // VERKAUFEN
        const saleValue = currentPosition.amount * candle.close;
        const fees = saleValue * 0.005; // 0.5% Fees
        const netSaleValue = saleValue - fees;
        const profit = netSaleValue - (currentPosition.amount * currentPosition.entryPrice);
        
        currentCapital += netSaleValue;
        openPositions.delete(token.address);
        tradesExecuted++;
        
        if (profit > 0) successfulTrades++;
        
        const reason = shouldSell ? 'Strategy Signal' : 
                     candle.close <= stopLoss ? 'Stop-Loss (35%)' : 'Take-Profit (200%)';
        
        console.log(`🔴 SELL EXECUTED: ${token.symbol} at $${candle.close.toFixed(6)}`);
        console.log(`   Reason: ${reason}, Profit: $${profit.toFixed(2)}`);
        console.log(`   New capital: $${currentCapital.toFixed(2)}`);
      }
    }
    
    // KAUF-LOGIK prüfen (nur wenn keine Position)
    else {
      console.log(`🔍 BUY CHECK: No position - checking strategy signal...`);
      
      const buySignal = getBotSignal(
        botType,
        token,
        candle,
        tokenHistory,
        candle.candleIndex
      );
      
      console.log(`   Bot signal: ${buySignal}`);
      
      if (buySignal === 'BUY' && currentCapital > 100) { // Min $100 für Trade
        // KAUFEN
        const maxRiskPerTrade = currentCapital * 0.3; // 30% Risiko pro Trade
        const positionSize = Math.min(maxRiskPerTrade, currentCapital * 0.2); // Max 20% Portfolio pro Position
        const fees = positionSize * 0.005; // 0.5% Fees
        const actualInvestment = positionSize - fees;
        const tokenAmount = actualInvestment / candle.close;
        
        openPositions.set(token.address, {
          tokenAddress: token.address,
          amount: tokenAmount,
          entryPrice: candle.close,
          entryTime: candle.timestamp,
          entryIndex: candle.candleIndex,
          stopLoss: candle.close * 0.65,
          takeProfit: candle.close * 3.0
        });
        
        currentCapital -= positionSize;
        tradesExecuted++;
        
        console.log(`🟢 BUY EXECUTED: ${token.symbol} at $${candle.close.toFixed(6)}`);
        console.log(`   Amount: ${tokenAmount.toFixed(2)} tokens, Value: $${positionSize.toFixed(2)}`);
        console.log(`   New capital: $${currentCapital.toFixed(2)}`);
        console.log(`   Stop Loss: $${(candle.close * 0.65).toFixed(6)}, Take Profit: $${(candle.close * 3.0).toFixed(6)}`);
      } else if (buySignal === 'BUY') {
        console.log(`❌ BUY signal ignored - insufficient capital: $${currentCapital.toFixed(2)}`);
      }
    }
  }
  
  console.log(`\n🏁 === TRADING DAY SIMULATION END ===`);
  console.log(`Trades executed: ${tradesExecuted}, Successful: ${successfulTrades}`);
  console.log(`Final capital: $${currentCapital.toFixed(2)}, Open positions: ${openPositions.size}`);
  
  return {
    endingCapital: currentCapital,
    tradesExecuted,
    successfulTrades
  };
}

/**
 * Wählt Token basierend auf Bot-Strategie aus
 */
function selectTokensForBot(
  tokens: BitqueryToken[], 
  botType: string, 
  count: number
): BitqueryToken[] {
  
  let scored = tokens.map(token => ({
    token,
    score: calculateTokenScore(token, botType)
  }));

  // Sortiere nach Score und wähle beste aus
  scored.sort((a, b) => b.score - a.score);
  
  return scored.slice(0, count).map(item => item.token);
}

/**
 * Bewertet Token für spezifische Bot-Strategien
 * ERWEITERT: Nutzt neue Bitquery-Daten (Buy/Sell-Volume, Trader-Counts, etc.)
 */
function calculateTokenScore(token: BitqueryToken, botType: string): number {
  let score = 0;
  
  // Basis-Score: Market Cap und Volume
  score += Math.min(token.marketCap / 100000, 5); // Max 5 Punkte für MCap
  score += Math.min(token.volume24h / 50000, 3); // Max 3 Punkte für Volume
  
  // NEUE FAKTOREN basierend auf erweiterten Bitquery-Daten
  const buyVol = token.buyVolume || 0;
  const sellVol = token.sellVolume || 0;
  const traders = token.tradersCount || 1;
  const buys = token.tradeStats?.buys || 0;
  const sells = token.tradeStats?.sells || 0;
  const avgTradeSize = token.tradeStats?.avgTradeSize || 0;
  const liquidityUSD = token.liquidityUSD || 0;
  
  console.log(`📊 Scoring ${token.symbol} for ${botType}:`);
  console.log(`   MCap Score: ${Math.min(token.marketCap / 100000, 5)}`);
  console.log(`   Volume Score: ${Math.min(token.volume24h / 50000, 3)}`);
  console.log(`   Buy Volume: ${buyVol}`);
  console.log(`   Sell Volume: ${sellVol}`);
  console.log(`   Traders: ${traders}`);
  console.log(`   Buys: ${buys}`);
  console.log(`   Sells: ${sells}`);
  console.log(`   Avg Trade Size: ${avgTradeSize}`);
  console.log(`   Liquidity: $${liquidityUSD.toLocaleString()}`);
  
  score += Math.min(token.marketCap / 100000, 5);
  score += Math.min(token.volume24h / 50000, 3);
  score += Math.min(buyVol, 3);
  score += Math.min(sellVol, 3);
  score += Math.min(traders, 3);
  score += Math.min(buys, 3);
  score += Math.min(sells, 3);
  score += Math.min(avgTradeSize, 3);
  score += Math.min(liquidityUSD / 1000000, 2); // Max 2 Punkte für Liquidity
  
  return score;
}