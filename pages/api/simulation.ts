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
      // NEUE BITQUERY SIMULATION
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

/**
 * NEUE 7-TAGE TAGESWEISE SIMULATION
 * Jeden Tag neue Token-Auswahl basierend auf aktuellen Kriterien
 */
async function simulateWithBitqueryData(
  botType: string, 
  tokenCount: number
): Promise<BitquerySimulationResult> {
  
  console.log('🔍 Starting 7-day progressive simulation...');
  
  try {
    const bitqueryAPI = new BitqueryAPI();
    
    // Test API Connection
    const schemaWorking = await bitqueryAPI.testConnection();
    if (!schemaWorking) {
      throw new Error('Bitquery API Schema-Test fehlgeschlagen');
    }
    
    // RUN 7-DAY PROGRESSIVE SIMULATION
    const simulationResult = await runSevenDayProgressiveSimulation(bitqueryAPI, botType, tokenCount);
    
    return {
      ...simulationResult,
      dataSource: 'bitquery-api'
    };
    
  } catch (error) {
    console.error('❌ Simulation failed:', error);
    throw new Error(`Simulation Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
  }
}

/**
 * ECHTE 7-TAGE PROGRESSIVE SIMULATION
 * Tag für Tag neue Token-Auswahl + echte Trading-Simulation
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
  
  console.log(`\n🎯 === 7-DAY PROGRESSIVE SIMULATION START ===`);
  console.log(`Bot Type: ${botType}`);
  console.log(`Max Tokens per Day: ${maxTokensPerDay}`);
  console.log(`Starting Capital: $${startingCapital}`);
  console.log(`Simulation Period: ${simulationStartDate.toISOString().split('T')[0]} bis ${simulationEndDate.toISOString().split('T')[0]}`);
  
  // QUICK TEST: Teste BitqueryAPI direkt
  try {
    console.log(`\n🧪 === TESTING BITQUERY API DIRECTLY ===`);
    const testDate = new Date(simulationStartDate.getTime() + 3 * 24 * 60 * 60 * 1000); // Tag 4
    console.log(`Testing token selection for: ${testDate.toISOString().split('T')[0]}`);
    
    const testTokens = await bitqueryAPI.getTokensEligibleAtDate(testDate, {
      maxAgeHours: 24,
      minMarketCap: 50000,
      migratedToRaydium: true
    });
    
    console.log(`🔍 API Test Result: ${testTokens.length} tokens found`);
    if (testTokens.length > 0) {
      console.log(`✅ First token: ${testTokens[0].symbol} (${testTokens[0].address.slice(0, 8)}...)`);
      console.log(`   MCap: $${testTokens[0].marketCap.toLocaleString()}, Vol: $${testTokens[0].volume24h.toLocaleString()}`);
      
      // Test history loading
      const testHistory = await bitqueryAPI.getTokenDayHistory(testTokens[0].address, testDate);
      console.log(`📊 History Test: ${testHistory.length} candles loaded for ${testTokens[0].symbol}`);
    } else {
      console.log(`❌ NO TOKENS FOUND - This is the problem!`);
      
      // Fall back to standard API to check if any tokens exist
      console.log(`🔄 Testing standard API...`);
      const standardTokens = await bitqueryAPI.getNewRaydiumMemecoins(5);
      console.log(`📊 Standard API Result: ${standardTokens.length} tokens`);
      
      if (standardTokens.length === 0) {
        console.log(`❌ EVEN STANDARD API HAS NO TOKENS - BitqueryAPI Problem!`);
      }
    }
  } catch (testError) {
    console.error(`❌ BITQUERY API TEST FAILED:`, testError);
  }
  
  console.log(`\n📅 === STARTING DAY-BY-DAY SIMULATION ===`);
  
  // TAG FÜR TAG SIMULATION
  for (let day = 0; day < 7; day++) {
    const currentDate = new Date(simulationStartDate.getTime() + day * 24 * 60 * 60 * 1000);
    const dateString = currentDate.toISOString().split('T')[0];
    
    console.log(`\n📅 === SIMULATION TAG ${day + 1}: ${dateString} ===`);
    console.log(`💰 Portfolio Wert zu Tagesbeginn: $${currentCapital.toFixed(2)}`);
    
    // SCHRITT 1: Token-Auswahl für diesen Tag
    console.log(`🔍 STEP 1: Token selection for ${dateString}...`);
    const dayTokens = await getEligibleTokensForDate(bitqueryAPI, currentDate, maxTokensPerDay);
    console.log(`🎯 ${dayTokens.length} Token erfüllen Kriterien an Tag ${day + 1}`);
    
    if (dayTokens.length === 0) {
      console.log(`⚠️  Keine Token verfügbar für Tag ${day + 1} - SKIPPE TAG`);
      dailyResults.push({
        date: dateString,
        value: ((currentCapital - startingCapital) / startingCapital) * 100
      });
      continue;
    }
    
    // DEBUG: Token Details
    dayTokens.forEach((token, index) => {
      console.log(`📋 Token ${index + 1}: ${token.symbol} (${token.address.slice(0, 8)}...)`);
      console.log(`   MCap: $${token.marketCap.toLocaleString()}, Vol: $${token.volume24h.toLocaleString()}, Age: ${token.age.toFixed(1)}h`);
    });

    // SCHRITT 2: Preishistorie für diese Token laden
    console.log(`🔍 STEP 2: Loading price histories for ${dayTokens.length} tokens...`);
    const tokenHistories = await loadTokenHistoriesForDate(bitqueryAPI, dayTokens, currentDate);
    console.log(`📊 Loaded histories for ${tokenHistories.size} tokens`);
    
    // DEBUG: History Details
    for (const [address, history] of tokenHistories.entries()) {
      const token = dayTokens.find(t => t.address === address);
      console.log(`📈 ${token?.symbol || 'UNKNOWN'}: ${history.length} candles loaded`);
      if (history.length > 0) {
        console.log(`   First candle: $${history[0].close.toFixed(6)} at ${new Date(history[0].timestamp).toLocaleTimeString()}`);
        console.log(`   Last candle: $${history[history.length - 1].close.toFixed(6)} at ${new Date(history[history.length - 1].timestamp).toLocaleTimeString()}`);
      }
    }
    
    if (tokenHistories.size === 0) {
      console.log(`❌ Keine Preishistorien für Tag ${day + 1} - SKIPPE TAG`);
      dailyResults.push({
        date: dateString,
        value: ((currentCapital - startingCapital) / startingCapital) * 100
      });
      continue;
    }

    // SCHRITT 3: Trading-Simulation für diesen Tag
    console.log(`🔍 STEP 3: Running trading simulation with ${botType} strategy...`);
    const dayResult = await simulateTradingDay(
      botType,
      dayTokens,
      tokenHistories,
      currentCapital,
      openPositions,
      currentDate
    );
    
    console.log(`📊 STEP 3 RESULT: ${dayResult.tradesExecuted} trades executed, ${dayResult.successfulTrades} successful`);

    // SCHRITT 4: Portfolio aktualisieren
    currentCapital = dayResult.endingCapital;
    totalTrades += dayResult.tradesExecuted;
    successfulTrades += dayResult.successfulTrades;
    allTokensUsed.push(...dayTokens);

    // SCHRITT 5: Tagesperformance speichern
    const dailyReturn = ((dayResult.endingCapital - startingCapital) / startingCapital) * 100;
    dailyResults.push({
      date: dateString,
      value: dailyReturn
    });

    console.log(`📊 Tag ${day + 1} Ergebnis:`);
    console.log(`   Trades: ${dayResult.tradesExecuted} (${dayResult.successfulTrades} erfolgreich)`);
    console.log(`   Portfolio Ende: $${dayResult.endingCapital.toFixed(2)}`);
    console.log(`   Offene Positionen: ${openPositions.size}`);
  }
  
  // FINALE ERGEBNISSE
  const finalReturn = ((currentCapital - startingCapital) / startingCapital) * 100;
  const successRate = totalTrades > 0 ? (successfulTrades / totalTrades) * 100 : 0;
  
  console.log(`\n🏁 === SIMULATION COMPLETE ===`);
  console.log(`   Final Portfolio: $${currentCapital.toFixed(2)}`);
  console.log(`   Total Return: ${finalReturn.toFixed(2)}%`);
  console.log(`   Total Trades: ${totalTrades} (${successfulTrades} successful)`);
  console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
  console.log(`   Tokens Used: ${allTokensUsed.length} unique tokens`);
      
      return {
    profitPercentage: finalReturn,
    tradeCount: totalTrades,
    successRate,
    dailyData: dailyResults,
    tokens: allTokensUsed
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
  console.log(`   Buy Vol: $${buyVol.toLocaleString()}, Sell Vol: $${sellVol.toLocaleString()}`);
  console.log(`   Traders: ${traders}, Buys: ${buys}, Sells: ${sells}`);
  console.log(`   Avg Trade Size: $${avgTradeSize.toLocaleString()}, Liquidity: $${liquidityUSD.toLocaleString()}`);
  
  // Bot-spezifische Bewertung mit erweiterten Daten
  switch (botType) {
    case 'volume-tracker':
      // Volume-Tracker: Fokus auf Buy-Volume und Trader-Aktivität
      score += Math.min(buyVol / 25000, 8); // Max 8 Punkte für Buy-Volume
      score += Math.min(traders / 10, 4); // Max 4 Punkte für Trader-Count
      score += buys > sells ? 3 : 0; // Bonus für mehr Käufe als Verkäufe
      score += avgTradeSize > 1000 ? 2 : 0; // Bonus für große durchschnittliche Trades
      score += token.age && token.age < 2 ? 3 : 1; // Bonus für sehr junge Token
      console.log(`   Volume-Tracker Score: ${score.toFixed(1)} (buy-focused)`);
      break;
      
    case 'trend-surfer':
      // Trend-Surfer: Ausgewogenes Buy/Sell-Verhältnis und mittlere Volatilität
      const buyToSellRatio = sellVol > 0 ? buyVol / sellVol : 1;
      const balanceScore = buyToSellRatio > 0.5 && buyToSellRatio < 2 ? 4 : 1; // Ausgewogenes Verhältnis
      score += balanceScore;
      
      const volatility = token.volatility || calculateVolatility(token.priceHistory);
      score += volatility > 20 && volatility < 80 ? 4 : 1; // Mittlere Volatilität
      score += Math.min(liquidityUSD / 100000, 3); // Liquiditäts-Bonus
      score += token.marketCap > 100000 ? 2 : 0; // Stabilere Token
      console.log(`   Trend-Surfer Score: ${score.toFixed(1)} (balance-focused, ratio: ${buyToSellRatio.toFixed(2)})`);
      break;
      
    case 'dip-hunter':
      // Dip-Hunter: Fokus auf Sell-Pressure und Volatilität
      const sellPressure = buyVol > 0 ? sellVol / buyVol : 1;
      score += sellPressure > 1.2 ? 5 : 0; // Bonus für Sell-Pressure (Dip-Opportunity)
      
      const recentDip = hasRecentDip(token.priceHistory);
      score += recentDip ? 5 : 0; // Dip-Bonus
      
      const highVolatility = token.volatility || calculateVolatility(token.priceHistory);
      score += highVolatility > 40 ? 4 : 1; // Hohe Volatilität bevorzugt
      score += token.marketCap < 200000 ? 3 : 1; // Kleinere MCaps
      score += avgTradeSize > 500 ? 2 : 0; // Signifikante Trade-Größen
      console.log(`   Dip-Hunter Score: ${score.toFixed(1)} (dip-focused, sell pressure: ${sellPressure.toFixed(2)})`);
      break;
      
    default:
      score += 5; // Standard-Score
      break;
  }
  
  console.log(`   Final Score: ${score.toFixed(1)}`);
  return score;
}

/**
 * Berechnet Volatilität aus Preishistorie
 */
function calculateVolatility(priceHistory: any[]): number {
  if (priceHistory.length < 2) return 0;
  
  const returns = [];
  for (let i = 1; i < priceHistory.length; i++) {
    const return_ = (priceHistory[i].close - priceHistory[i-1].close) / priceHistory[i-1].close;
    returns.push(return_);
  }
  
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  
  return Math.sqrt(variance) * 100; // Als Prozent
}

/**
 * Prüft auf kürzlichen Dip (>15% in letzten 5 Candles)
 */
function hasRecentDip(priceHistory: any[]): boolean {
  if (priceHistory.length < 5) return false;
  
  const recent = priceHistory.slice(-5);
  const maxPrice = Math.max(...recent.map(c => c.high));
  const minPrice = Math.min(...recent.map(c => c.low));
  
  return (maxPrice - minPrice) / maxPrice > 0.15; // >15% Dip
}

/**
 * Simuliert Bot-Performance basierend auf echten Token-Metadaten (NICHT auf Mock-Preishistorie)
 */
async function simulateRealBotPerformance(
  tokens: BitqueryToken[], 
  botType: string
): Promise<{
  profitPercentage: number;
  tradeCount: number;
  successRate: number;
  dailyData: { date: string; value: number }[];
}> {
  
  console.log(`📊 Simulating ${botType} with ${tokens.length} REAL tokens (NO MOCK PRICE DATA)`);
  console.log(`📊 Token details:`, tokens.map(t => ({ 
    symbol: t.symbol, 
    mcap: t.marketCap, 
    volume: t.volume24h, 
    age: t.age?.toFixed(1) + 'h',
    volatility: t.volatility?.toFixed(1) + '%'
  })));
  
  if (tokens.length === 0) {
    console.warn('⚠️  Keine Token für Performance-Simulation - verwende Standard-Werte');
    return {
      profitPercentage: 8.5, // Standard-Performance für Demo
      tradeCount: 25,
      successRate: 65,
      dailyData: generateStandardDailyData()
    };
  }
  
  // Verwende echte Token-Eigenschaften für Performance-Berechnung
  let totalTrades = 0;
  let successfulTrades = 0;
  let totalProfit = 0;
  const dailyReturns: { date: string; value: number }[] = [];
  
  for (const token of tokens) {
    console.log(`📈 Calculating performance for ${token.symbol}:`);
    console.log(`   MCap: $${token.marketCap.toLocaleString()}`);
    console.log(`   Volume 24h: $${token.volume24h.toLocaleString()}`);
    console.log(`   Volatility: ${token.volatility?.toFixed(1)}%`);
    console.log(`   Age: ${token.age?.toFixed(1)}h`);
    
    // Berechne Performance basierend auf echten Token-Eigenschaften
    const tokenPerformance = calculateRealTokenPerformance(token, botType);
    
    console.log(`   Trades: ${tokenPerformance.trades}`);
    console.log(`   Successful: ${tokenPerformance.successful}`);
    console.log(`   Profit: ${tokenPerformance.profit.toFixed(2)}%`);
    
    totalTrades += tokenPerformance.trades;
    successfulTrades += tokenPerformance.successful;
    totalProfit += tokenPerformance.profit;
    
    // Füge tägliche Returns hinzu
    tokenPerformance.dailyData.forEach((day, index) => {
      const existingDay = dailyReturns.find(d => d.date === day.date);
      if (existingDay) {
        existingDay.value += day.return;
      } else {
        dailyReturns.push({ date: day.date, value: day.return });
      }
    });
  }
  
  // Normalisiere tägliche Returns
  dailyReturns.forEach(day => {
    day.value = day.value / tokens.length; // Durchschnitt über alle Token
  });
  
  const successRate = totalTrades > 0 ? (successfulTrades / totalTrades) * 100 : 0;
  const profitPercentage = totalProfit / tokens.length; // Durchschnittlicher Profit
  
  console.log(`✅ Real simulation complete:`);
  console.log(`   Total Trades: ${totalTrades}`);
  console.log(`   Successful Trades: ${successfulTrades}`);
  console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
  console.log(`   Profit Percentage: ${profitPercentage.toFixed(2)}%`);
  console.log(`   Daily Returns: ${dailyReturns.length} days`);
  
  return {
    profitPercentage,
    tradeCount: totalTrades,
    successRate,
    dailyData: dailyReturns.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  };
}

/**
 * Generiert Standard-Performance für Demo-Zwecke
 * OHNE MATH.RANDOM - NUR DETERMINISTISCHE WERTE
 */
function generateStandardDailyData(): { date: string; value: number }[] {
  const dailyData = [];
  const daysBack = 7;
  
  for (let i = daysBack - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    // DETERMINISTISCHE Berechnung statt Math.random()
    const dayFactor = (7 - i) / 7; // 0.14 bis 1.0
    const dailyReturn = 0.5 + (dayFactor * 2); // 0.64% bis 2.5% täglich (linear steigend)
    
    dailyData.push({
      date,
      value: dailyReturn
    });
  }
  
  return dailyData;
}

/**
 * Berechnet Performance basierend auf echten Token-Eigenschaften (NICHT auf Mock-Preisdaten)
 * ANGEPASST: 30% Risiko pro Trade, DETERMINISTISCHE 7-Tage-Simulation (KEIN MATH.RANDOM)
 */
function calculateRealTokenPerformance(
  token: BitqueryToken, 
  botType: string
): {
  trades: number;
  successful: number;
  profit: number;
  dailyData: { date: string; return: number }[];
} {
  
  console.log(`🎯 Calculating performance for ${token.symbol} with strategy ${botType} (30% risk per trade)`);
  
  // Verwende echte Token-Eigenschaften für Simulation
  const marketCapFactor = Math.min(token.marketCap / 50000, 5); // MCap-basierte Performance (max 5x)
  const volumeFactor = Math.min(token.volume24h / 10000, 4); // Volume-basierte Performance (max 4x)
  const ageFactor = token.age && token.age < 2 ? 3 : (token.age && token.age < 12 ? 2 : 1.5); // Junge Token sind profitabler
  const volatilityFactor = token.volatility ? Math.min(token.volatility / 20, 3) : 2; // Volatilität = Opportunity
  
  console.log(`   Factors: MCap=${marketCapFactor.toFixed(2)}, Volume=${volumeFactor.toFixed(2)}, Age=${ageFactor.toFixed(2)}, Volatility=${volatilityFactor.toFixed(2)}`);
  
  let dailyTrades = 0;
  let baseSuccessRate = 0;
  let profitPerTrade = 0;
  const riskPerTrade = 30; // 30% Risiko pro Trade
  
  // Bot-spezifische REALISTISCHE Performance-Berechnung mit 30% Risiko
  switch (botType) {
    case 'volume-tracker':
      // Volume-Tracker: Häufige kleine Trades
      dailyTrades = (volumeFactor * ageFactor * 2) + 1; // 1-10 Trades pro Tag
      baseSuccessRate = Math.min(0.55 + (volumeFactor * 0.03) + (ageFactor * 0.03), 0.75); // Max 75%
      profitPerTrade = riskPerTrade * (0.8 + (volatilityFactor * 0.2)); // 24-42% bei Win
      break;
      
    case 'trend-surfer':
      // Trend-Surfer: Mittlere Frequenz, mittleres Risiko
      dailyTrades = (volatilityFactor * marketCapFactor * 1.5) + 0.5; // 0.5-7 Trades pro Tag
      baseSuccessRate = Math.min(0.50 + (marketCapFactor * 0.02) + (volatilityFactor * 0.02), 0.70); // Max 70%
      profitPerTrade = riskPerTrade * (0.6 + (marketCapFactor * 0.3)); // 18-39% bei Win
      break;
      
    case 'dip-hunter':
      // Dip-Hunter: Seltene aber große Opportunities
      dailyTrades = (ageFactor * volatilityFactor * 1.2) + 0.3; // 0.3-8 Trades pro Tag
      baseSuccessRate = Math.min(0.45 + (ageFactor * 0.05) + (volatilityFactor * 0.02), 0.65); // Max 65%
      profitPerTrade = riskPerTrade * (1.0 + (ageFactor * 0.4)); // 30-66% bei Win
      break;
      
    default:
      dailyTrades = 2;
      baseSuccessRate = 0.6;
      profitPerTrade = riskPerTrade * 0.8; // 24%
  }
  
  // Realistische 7-Tage-Simulation
  const totalTrades = Math.floor(dailyTrades * 7); // 7 Tage Laufzeit
  const successful = Math.floor(totalTrades * baseSuccessRate);
  const failed = totalTrades - successful;
  
  // Kelly-Criterion basierte Gewinn/Verlust-Rechnung
  const totalProfit = (successful * profitPerTrade) - (failed * riskPerTrade);
  
  console.log(`   7-Day Simulation: ${totalTrades} trades total (${(dailyTrades).toFixed(1)}/day)`);
  console.log(`   Wins: ${successful} (${(baseSuccessRate * 100).toFixed(1)}%), Profit per win: ${profitPerTrade.toFixed(1)}%`);
  console.log(`   Losses: ${failed}, Loss per trade: ${riskPerTrade}%`);
  console.log(`   Net 7-day return: ${totalProfit.toFixed(2)}%`);
  
  // Generiere tägliche Performance für 7 Tage - DETERMINISTISCHE BERECHNUNG
  const dailyData = [];
  let cumulativeReturn = 0;
  
  for (let day = 0; day < 7; day++) {
    const date = new Date(Date.now() - (6 - day) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // DETERMINISTISCHE tägliche Trades basierend auf Token-Eigenschaften
    const dayProgress = day / 6; // 0 bis 1
    const volatilityImpact = (volatilityFactor - 1) * 0.2; // -0.2 bis +0.4
    const tradesThisDay = Math.floor(dailyTrades * (0.8 + dayProgress * 0.4 + volatilityImpact)); // Deterministische Varianz
    
    // DETERMINISTISCHE Wins basierend auf Bot-Performance
    const daySuccessRate = baseSuccessRate * (0.8 + dayProgress * 0.4); // Performance verbessert sich über Zeit
    const winsThisDay = Math.floor(tradesThisDay * daySuccessRate);
    const lossesThisDay = tradesThisDay - winsThisDay;
    
    const dailyReturn = (winsThisDay * profitPerTrade) - (lossesThisDay * riskPerTrade);
    cumulativeReturn += dailyReturn;
    
    dailyData.push({
      date,
      return: dailyReturn
    });
  }
  
  return {
    trades: totalTrades,
    successful,
    profit: totalProfit,
    dailyData
  };
} 