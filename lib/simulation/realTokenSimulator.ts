/**
 * Real Token Simulator für Solana Memecoins
 * 
 * Nutzt echte APIs um realistische Memecoin-Daten von Solana zu simulieren.
 * Basiert auf echten DEX-Daten von Raydium, Pump.fun, Jupiter etc.
 */

export interface RealTokenData {
  address: string;
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  liquidityPool: number;
  holders: number;
  trades24h: number;
  isRugPull?: boolean;
  dexes: string[];
  createdAt: string;
}

export interface PriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Birdeye API für Solana Token-Daten
 */
class BirdeyeAPI {
  private baseUrl = 'https://public-api.birdeye.so';
  private apiKey = process.env.BIRDEYE_API_KEY || '';
  
  async getTokenOverview(tokenAddress: string): Promise<RealTokenData | null> {
    try {
      if (!this.apiKey) {
        console.error('Birdeye API Key fehlt');
        return null;
      }
      
      const response = await fetch(`${this.baseUrl}/defi/token_overview?address=${tokenAddress}`, {
        headers: {
          'X-API-KEY': this.apiKey,
          'accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error(`Birdeye API Error: ${response.status} ${response.statusText}`);
        return null;
      }
      
      const data = await response.json();
      if (!data.data) {
        console.error('Birdeye API: Keine Daten zurückgegeben');
        return null;
      }
      
      return this.mapBirdeyeData(data.data);
    } catch (error) {
      console.error('Birdeye API Error:', error);
      return null;
    }
  }
  
  async getTokenPriceHistory(tokenAddress: string, timeframe: string = '24h'): Promise<PriceData[]> {
    try {
      if (!this.apiKey) {
        console.error('Birdeye API Key fehlt');
        return [];
      }
      
      const response = await fetch(`${this.baseUrl}/defi/history_price?address=${tokenAddress}&address_type=token&type=${timeframe}`, {
        headers: {
          'X-API-KEY': this.apiKey,
          'accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error(`Birdeye Price History Error: ${response.status} ${response.statusText}`);
        return [];
      }
      
      const data = await response.json();
      if (!data.data?.items || !Array.isArray(data.data.items)) {
        console.error('Birdeye API: Keine Preishistorie zurückgegeben');
        return [];
      }
      
      return this.mapPriceHistory(data.data.items);
    } catch (error) {
      console.error('Birdeye Price History Error:', error);
      return [];
    }
  }
  
  // NEUE FUNKTION: Holt echte 7-Tage-Historie für mehrere Token
  async getMultiTokenHistory(tokenAddresses: string[]): Promise<Map<string, PriceData[]>> {
    const historyMap = new Map<string, PriceData[]>();
    
    // Versuche zuerst echte API-Daten zu holen (falls verfügbar)
    if (this.apiKey && typeof window === 'undefined') {
      console.log('Trying to fetch real price histories from API...');
      try {
        const requests = tokenAddresses.slice(0, 3).map(async (address) => {
          try {
            const history = await this.getTokenPriceHistory(address, '7D');
            if (history.length > 0) {
              const validHistory = history.filter(price => 
                price.close > 0 && 
                price.volume > 0 && 
                price.timestamp > 0
              );
              
              if (validHistory.length > 0) {
                historyMap.set(address, validHistory);
              }
            }
          } catch (error) {
            console.log(`No real data for ${address}, will generate synthetic data`);
          }
        });
        
        await Promise.all(requests);
      } catch (error) {
        console.log('API requests failed, generating synthetic data');
      }
    }
    
    console.log(`Retrieved ${historyMap.size} real price histories, generating synthetic data for remaining tokens`);
    return historyMap;
  }
  
  // Aggregiert tägliche Daten aus stündlichen/minütlichen Daten
  aggregateToDailyData(priceData: PriceData[]): { date: string; value: number }[] {
    const dailyGroups: { [date: string]: PriceData[] } = {};
    
    // Gruppiere Daten nach Tagen
    priceData.forEach(item => {
      const date = new Date(item.timestamp).toISOString().split('T')[0];
      if (!dailyGroups[date]) {
        dailyGroups[date] = [];
      }
      dailyGroups[date].push(item);
    });
    
    // Berechne tägliche Performance (Close-to-Close)
    const dailyData: { date: string; value: number }[] = [];
    const sortedDates = Object.keys(dailyGroups).sort();
    let baseValue = 100;
    
    for (let i = 0; i < sortedDates.length; i++) {
      const date = sortedDates[i];
      const dayData = dailyGroups[date];
      
      if (dayData.length > 0) {
        const dayOpen = dayData[0].open;
        const dayClose = dayData[dayData.length - 1].close;
        
        if (i === 0) {
          // Erster Tag als Baseline
          dailyData.push({ date, value: baseValue });
        } else {
          // Berechne Veränderung zum Vortag
          const previousClose = dailyGroups[sortedDates[i-1]][dailyGroups[sortedDates[i-1]].length - 1].close;
          const changePercent = (dayClose - previousClose) / previousClose;
          baseValue *= (1 + changePercent);
          dailyData.push({ date, value: baseValue });
        }
      }
    }
    
    return dailyData;
  }
  
  private mapBirdeyeData(data: any): RealTokenData {
    return {
      address: data.address,
      symbol: data.symbol,
      name: data.name,
      price: data.price,
      priceChange24h: data.priceChange24hPercent,
      volume24h: data.volume24h,
      marketCap: data.marketCap,
      liquidityPool: data.liquidity,
      holders: data.holder,
      trades24h: data.trade24h,
      dexes: ['Raydium', 'Jupiter', 'Orca'],
      createdAt: new Date(data.createdTime).toISOString()
    };
  }
  
  private mapPriceHistory(items: any[]): PriceData[] {
    return items
      .filter(item => 
        typeof item.o === 'number' && 
        typeof item.h === 'number' && 
        typeof item.l === 'number' && 
        typeof item.c === 'number' && 
        typeof item.v === 'number' && 
        typeof item.unixTime === 'number'
      )
      .map(item => ({
        timestamp: item.unixTime * 1000,
        open: item.o,
        high: item.h,
        low: item.l,
        close: item.c,
        volume: item.v
      }))
      .filter(price => 
        price.close > 0 && 
        price.volume > 0 && 
        price.timestamp > 0
      );
  }
}

/**
 * DexScreener API für zusätzliche DEX-Daten
 */
class DexScreenerAPI {
  private baseUrl = 'https://api.dexscreener.com/latest';
  
  async getTokenPairs(tokenAddress: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/dex/tokens/${tokenAddress}`);
      const data = await response.json();
      return data.pairs || [];
    } catch (error) {
      console.error('DexScreener API Error:', error);
      return [];
    }
  }
  
  async getLatestMemecoinPairs(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/dex/search/?q=SOL`);
      const data = await response.json();
      // Filter für Solana-basierte Memecoins
      return data.pairs?.filter((pair: any) => 
        pair.chainId === 'solana' && 
        pair.fdv && pair.fdv < 10000000 && // Market Cap unter 10M
        pair.volume?.h24 > 50000 // Mindestens 50k Volume
      ) || [];
    } catch (error) {
      console.error('DexScreener Search Error:', error);
      return [];
    }
  }
}

/**
 * Pump.fun API für neue Token
 */
class PumpFunAPI {
  private baseUrl = 'https://frontend-api.pump.fun';
  
  async getNewTokens(limit: number = 50): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/coins?offset=0&limit=${limit}&sort=created_timestamp&order=DESC&includeNsfw=false`);
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Pump.fun API Error:', error);
      return [];
    }
  }
  
  async getTokenDetails(tokenAddress: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/coins/${tokenAddress}`);
      return await response.json();
    } catch (error) {
      console.error('Pump.fun Token Details Error:', error);
      return null;
    }
  }
}

import { getHistoricalCandles, USDC_MINT } from '../jupiter/index';

/**
 * Hauptklasse für echte Token-Simulation
 */
export class RealTokenSimulator {
  private birdeyeAPI = new BirdeyeAPI();
  private dexScreenerAPI = new DexScreenerAPI();
  private pumpFunAPI = new PumpFunAPI();
  
  /**
   * Holt echte Token mit Market Cap >= 20.000 USD (letzte 24h)
   * und berechnet priceChange24h und volume24h aus Jupiter Candles
   */
  async getRealMemecoinData(count: number = 20): Promise<RealTokenData[]> {
    // Hier: Annahme, dass du eine Token-Liste hast (z.B. aus Pump Fun API oder Jupiter Token List)
    // Für Demo: Wir nehmen die Jupiter Token List und filtern nach Market Cap
    const tokenList = await (await import('../jupiter/index')).loadTokenList();
    const filtered = tokenList
      .filter((t: any) => t.market_cap && t.market_cap >= 20000 && t.extensions?.coingeckoId)
      .sort((a: any, b: any) => b.market_cap - a.market_cap)
      .slice(0, count);
    const tokens: RealTokenData[] = [];
    for (const t of filtered) {
      // Hole echte Candles (USDC als Quote)
      const candles = await getHistoricalCandles(t.address, USDC_MINT.toString(), '5m');
      let priceChange24h = 0;
      let volume24h = 0;
      if (candles.length > 1) {
        const first = candles[0];
        const last = candles[candles.length - 1];
        priceChange24h = ((last.close - first.open) / first.open) * 100;
        volume24h = candles.reduce((sum, c) => sum + (c.volume || 0), 0);
      }
      tokens.push({
        address: t.address,
        symbol: t.symbol,
        name: t.name,
        price: candles.length > 0 ? candles[candles.length - 1].close : t.market_cap / 1_000_000_000,
        priceChange24h,
        volume24h,
        marketCap: t.market_cap,
        liquidityPool: 0, // Optional
        holders: 0, // Optional
        trades24h: 0, // Optional
        dexes: ['Jupiter'],
        createdAt: t?.createdAt || new Date().toISOString()
      });
    }
    return tokens;
  }

  /**
   * Holt echte 5-Minuten-OHLC-Daten für einen Token (max. 24h)
   */
  async getTokenOHLC(tokenAddress: string, hours: number = 24): Promise<PriceData[]> {
    const since = Math.floor((Date.now() - hours * 60 * 60 * 1000) / 1000);
    const candles = await getHistoricalCandles(tokenAddress, USDC_MINT.toString(), '5m', since);
    return candles.map(c => ({
      timestamp: c.timestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume
    }));
  }
  
  /**
   * Simuliert Bot-Performance basierend auf echten Token-Daten (nur Jupiter Candles)
   */
  async simulateWithRealData(
    botType: string,
    tokenCount: number = 10
  ): Promise<{
    profitPercentage: number;
    tradeCount: number;
    successRate: number;
    dailyData: { date: string; value: number }[];
    tokens: RealTokenData[];
    dataSource: 'real-api';
  }> {
    const tokens = await this.getRealMemecoinData(tokenCount);
    // Für jeden Token: Echte Jupiter Candles laden
    const historicalData = new Map<string, PriceData[]>();
    for (const token of tokens) {
      const ohlc = await this.getTokenOHLC(token.address, 24);
      historicalData.set(token.address, ohlc);
    }
    // Berechne realistische Performance basierend auf echten Daten
    const performance = await this.calculateRealPerformance(botType, tokens, historicalData);
    return {
      ...performance,
      tokens,
      dataSource: 'real-api'
    };
  }
  
  /**
   * Berechnet Performance basierend auf echten Token-Metriken
   */
  private async calculateRealPerformance(
    botType: string,
    tokens: RealTokenData[],
    historicalData: Map<string, PriceData[]>
  ): Promise<{
    profitPercentage: number;
    tradeCount: number;
    successRate: number;
    dailyData: { date: string; value: number }[];
  }> {
    // ECHTE 7-Tage Trading-Simulation statt oberflächlicher Multiplikation
    const tradingResults = await this.runRealTradingSimulation(botType, tokens, historicalData);
    
    return {
      profitPercentage: tradingResults.totalProfitPercent,
      tradeCount: tradingResults.totalTrades,
      successRate: tradingResults.successRate,
      dailyData: tradingResults.dailyPortfolioValues
    };
  }
  
  /**
   * ECHTE 7-Tage Trading-Simulation - als würde der Bot wirklich 7 Tage laufen
   */
  private async runRealTradingSimulation(
    botType: string,
    tokens: RealTokenData[],
    historicalData: Map<string, PriceData[]>
  ): Promise<{
    totalProfitPercent: number;
    totalTrades: number;
    successRate: number;
    dailyPortfolioValues: { date: string; value: number }[];
  }> {
    
    const startingCapital = 1000; // $1000 Startkapital
    let currentCapital = startingCapital;
    let totalTrades = 0;
    let successfulTrades = 0;
    const dailyPortfolioValues: { date: string; value: number }[] = [];
    
    // Aktuelle Positionen des Bots
    const positions: Map<string, { amount: number; entryPrice: number; entryTime: number }> = new Map();
    
    // Sammle und sortiere alle Preisdaten chronologisch
    const allPricePoints: (PriceData & { tokenAddress: string })[] = [];
    
    // Prüfe ob wir überhaupt historische Daten haben
    let hasValidData = false;
    tokens.forEach(token => {
      const tokenHistory = historicalData.get(token.address);
      if (tokenHistory && tokenHistory.length > 0) {
        hasValidData = true;
        tokenHistory.forEach(price => {
          if (price.close > 0 && price.volume > 0) { // Nur valide Preise
            allPricePoints.push({ ...price, tokenAddress: token.address });
          }
        });
      }
    });
    
    // Wenn keine validen Daten, gib 0 Performance zurück
    if (!hasValidData || allPricePoints.length === 0) {
      return {
        totalProfitPercent: 0,
        totalTrades: 0,
        successRate: 0, // Keine Trades = 0% Winrate
        dailyPortfolioValues: Array(7).fill(null).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return {
            date: date.toISOString().split('T')[0],
            value: 100 // Keine Änderung ohne Trades
          };
        })
      };
    }
    
    // Sortiere chronologisch
    allPricePoints.sort((a, b) => a.timestamp - b.timestamp);
    
    // Trading-Simulation über alle Zeitpunkte
    let currentDay = '';
    let dayStartCapital = currentCapital;
    
    for (let i = 0; i < allPricePoints.length; i++) {
      const currentPrice = allPricePoints[i];
      const token = tokens.find(t => t.address === currentPrice.tokenAddress);
      
      if (!token || currentPrice.close <= 0) continue; // Überspringe invalide Preise
      
      const currentDate = new Date(currentPrice.timestamp).toISOString().split('T')[0];
      
      // Neue Tagesberechnung
      if (currentDate !== currentDay) {
        if (currentDay) {
          // Berechne Tagesperformance
          const dayEndCapital = this.calculatePortfolioValue(currentCapital, positions, allPricePoints, i);
          const dayPerformance = ((dayEndCapital - dayStartCapital) / startingCapital) * 100;
          
          dailyPortfolioValues.push({
            date: currentDay,
            value: 100 + dayPerformance
          });
        }
        
        currentDay = currentDate;
        dayStartCapital = this.calculatePortfolioValue(currentCapital, positions, allPricePoints, i);
      }
      
      // Bot-spezifische Trading-Logik
      const tradingAction = this.getBotTradingDecision(
        botType, 
        token, 
        currentPrice, 
        allPricePoints.slice(Math.max(0, i - 24), i), // Letzte 24 Stunden Kontext
        positions.get(token.address)
      );
      
      // Führe Trading-Aktion aus
      if (tradingAction.action === 'BUY' && !positions.has(token.address)) {
        // HOLEN DES ECHTEN RISIKO-WERTES AUS DER UI / BOT-KONFIGURATION
        // HINWEIS: Dieser Wert muss an die Simulation übergeben werden.
        // Fürs Erste verwenden wir einen festen Wert, da die UI-Integration hier fehlt.
        const riskPerTradeFromUI = 0.05; // Beispiel: 5% Risiko pro Trade
        const positionSizePercent = riskPerTradeFromUI * 100;
        
        const investmentAmount = currentCapital * riskPerTradeFromUI;
        if (investmentAmount <= 0 || currentPrice.close <= 0) continue; // Überspringe invalide Trades
        
        const fees = investmentAmount * 0.005; // 0.5% Slippage/Fees
        const actualInvestment = investmentAmount - fees;
        const tokenAmount = actualInvestment / currentPrice.close;
        
        positions.set(token.address, {
          amount: tokenAmount,
          entryPrice: currentPrice.close,
          entryTime: currentPrice.timestamp
        });
        
        currentCapital -= investmentAmount;
        totalTrades++;
        
        console.log(`BUY: ${token.symbol} at ${currentPrice.close.toFixed(6)} - Size: ${positionSizePercent.toFixed(0)}% - Reason: ${tradingAction.reason}`);
        
      } else if (tradingAction.action === 'SELL' && positions.has(token.address)) {
        const position = positions.get(token.address)!;
        if (position.amount <= 0 || currentPrice.close <= 0) continue; // Überspringe invalide Trades
        
        const saleValue = position.amount * currentPrice.close;
        const fees = saleValue * 0.005; // 0.5% Slippage/Fees
        const netSaleValue = saleValue - fees;
        
        currentCapital += netSaleValue;
        
        // War der Trade erfolgreich?
        if (netSaleValue > position.amount * position.entryPrice) {
          successfulTrades++;
        }
        
        positions.delete(token.address);
        totalTrades++;
        
        console.log(`SELL: ${token.symbol} at ${currentPrice.close.toFixed(6)} - Reason: ${tradingAction.reason} - Profit: ${(((netSaleValue / (position.amount * position.entryPrice)) -1) * 100).toFixed(1)}%`);
      }
    }
    
    // Berechne finale Performance
    const finalCapital = this.calculatePortfolioValue(currentCapital, positions, allPricePoints, allPricePoints.length - 1);
    const totalProfitPercent = totalTrades > 0 ? ((finalCapital - startingCapital) / startingCapital) * 100 : 0;
    const successRate = totalTrades > 0 ? (successfulTrades / totalTrades) * 100 : 0;
    
    // Füge letzten Tag hinzu falls noch nicht
    if (dailyPortfolioValues.length < 7) {
      const lastDayPerformance = totalTrades > 0 ? ((finalCapital - startingCapital) / startingCapital) * 100 : 0;
      dailyPortfolioValues.push({
        date: currentDay,
        value: 100 + lastDayPerformance
      });
    }
    
    // Stelle sicher, dass wir exakt 7 Tage haben
    while (dailyPortfolioValues.length < 7) {
      const lastValue = dailyPortfolioValues[dailyPortfolioValues.length - 1]?.value || 100;
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() - (7 - dailyPortfolioValues.length));
      
      dailyPortfolioValues.push({
        date: nextDate.toISOString().split('T')[0],
        value: lastValue // Keine Variation ohne Trades
      });
    }
    
    return {
      totalProfitPercent,
      totalTrades,
      successRate,
      dailyPortfolioValues: dailyPortfolioValues.slice(-7) // Letzte 7 Tage
    };
  }
  
  /**
   * Bot-spezifische Trading-Entscheidungen - ECHTE Strategien
   */
  private getBotTradingDecision(
    botType: string,
    token: RealTokenData,
    currentPrice: PriceData,
    priceHistory: (PriceData & { tokenAddress: string })[],
    currentPosition?: { amount: number; entryPrice: number; entryTime: number }
  ): { action: 'BUY' | 'SELL' | 'HOLD'; sizePercent: number; reason: string } {
    
    const normalizedBotId = this.normalizeBotId(botType);
    
    switch (normalizedBotId) {
      case 'volume-tracker':
        return this.volumeTrackerStrategy(token, currentPrice, priceHistory, currentPosition);
        
      case 'trend-surfer':
        return this.trendSurferStrategy(token, currentPrice, priceHistory, currentPosition);
        
      case 'dip-hunter':
        return this.dipHunterStrategy(token, currentPrice, priceHistory, currentPosition);
        
      default:
        return { action: 'HOLD', sizePercent: 0, reason: 'Unknown strategy' };
    }
  }
  
  /**
   * Volume-Tracker Bot Strategie (Überarbeitet):
   * - Ignoriert erste Stunde nach Listing (Annäherung an 20 Min.)
   * - Kauft bei grüner Stundenkerze mit Volumen > 35% der Market Cap
   * - Stop-Loss: -35%
   * - Take-Profit: +150%
   * - Positionsgröße: Bestimmt durch Risiko-Schieberegler (wird extern gehandhabt)
   */
  private volumeTrackerStrategy(
    token: RealTokenData,
    currentPrice: PriceData,
    priceHistory: (PriceData & { tokenAddress: string })[],
    currentPosition?: { amount: number; entryPrice: number; entryTime: number }
  ): { action: 'BUY' | 'SELL' | 'HOLD'; sizePercent: number; reason: string } {
    
    // Mindestalter-Prüfung (Annäherung an 20 Min. nach Listing)
    // Wir verwenden stündliche Daten, daher prüfen wir auf > 1 Stunde seit Erstellung
    const tokenAgeHours = (currentPrice.timestamp - new Date(token.createdAt).getTime()) / (1000 * 60 * 60);
    if (tokenAgeHours < 1) {
      return { action: 'HOLD', sizePercent: 0, reason: `Token zu jung (${tokenAgeHours.toFixed(1)}h), warte >1h` };
    }
    
    // Market Cap Prüfung
    if (token.marketCap < 50000) {
      return { action: 'HOLD', sizePercent: 0, reason: `Market Cap zu niedrig (${(token.marketCap/1000).toFixed(0)}k)` };
    }

    // VERKAUFS-Logik (falls Position vorhanden)
    if (currentPosition) {
      const priceChange = (currentPrice.close - currentPosition.entryPrice) / currentPosition.entryPrice;
      
      // Take-Profit bei +150%
      if (priceChange >= 1.50) {
        return { 
          action: 'SELL', 
          sizePercent: 100, // Positionsgröße wird extern über Risiko-Regler bestimmt
          reason: `Take-Profit erreicht (+${(priceChange * 100).toFixed(0)}%)` 
        };
      }
      
      // Stop-Loss bei -35%
      if (priceChange <= -0.35) {
        return { 
          action: 'SELL', 
          sizePercent: 100, 
          reason: `Stop-Loss ausgelöst (${(priceChange * 100).toFixed(0)}%)` 
        };
      }
    }
    
    // KAUF-Logik (falls keine Position)
    if (!currentPosition) {
      // Bedingung: Grüne Kerze (Schlusskurs > Eröffnungskurs)
      const isGreenCandle = currentPrice.close > currentPrice.open;
      
      // Bedingung: Stundenvolumen > 35% der aktuellen Market Cap
      // Annahme: currentPrice.volume ist das Volumen der aktuellen Stunde
      const volumeThreshold = token.marketCap * 0.35;
      const hasEnoughVolume = currentPrice.volume > volumeThreshold;
      
      if (isGreenCandle && hasEnoughVolume) {
        // Positionsgröße wird extern durch Risiko-Regler bestimmt, hier als Platzhalter 20%
        // In der Hauptsimulation wird die `sizePercent` aus der Bot-Konfiguration/UI genommen.
        return { 
          action: 'BUY', 
          sizePercent: 20, // Platzhalter - Echte Größe kommt vom Risiko-Regler
          reason: `Grüne Kerze mit Volumen >35% MC (Vol: ${(currentPrice.volume/1000).toFixed(0)}k, MC: ${(token.marketCap/1000).toFixed(0)}k)` 
        };
      }
    }
    
    return { action: 'HOLD', sizePercent: 0, reason: 'Kein valides Kaufsignal' };
  }
  
  /**
   * Trend-Surfer Bot Strategie: Folgt Momentum und Trends
   */
  private trendSurferStrategy(
    token: RealTokenData,
    currentPrice: PriceData,
    priceHistory: (PriceData & { tokenAddress: string })[],
    currentPosition?: { amount: number; entryPrice: number; entryTime: number }
  ): { action: 'BUY' | 'SELL' | 'HOLD'; sizePercent: number; reason: string } {
    
    if (priceHistory.length < 6) {
      return { action: 'HOLD', sizePercent: 0, reason: 'Insufficient data' };
    }
    
    // Berechne 6-Stunden Trend
    const prices = priceHistory.slice(-6).map(p => p.close);
    const priceChanges = [];
    for (let i = 1; i < prices.length; i++) {
      priceChanges.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    
    const avgTrend = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;
    const trendStrength = Math.abs(avgTrend);
    const isUptrend = avgTrend > 0;
    
    // VERKAUFS-Logik
    if (currentPosition) {
      const priceChange = (currentPrice.close - currentPosition.entryPrice) / currentPosition.entryPrice;
      const timeSinceEntry = (currentPrice.timestamp - currentPosition.entryTime) / (1000 * 60 * 60);
      
      // Verkaufe bei Trendwechsel ODER Gewinn-Mitnahme ODER Stop-Loss
      if ((!isUptrend && trendStrength > 0.02) || 
          (priceChange > 0.15) || 
          (priceChange < -0.08) ||
          timeSinceEntry > 12) {
        return { 
          action: 'SELL', 
          sizePercent: 100, 
          reason: `Trend change or profit/loss trigger (trend: ${(avgTrend * 100).toFixed(2)}%)` 
        };
      }
    }
    
    // KAUF-Logik
    if (!currentPosition) {
      // Starker Aufwärtstrend = Kaufsignal
      if (isUptrend && trendStrength > 0.03 && currentPrice.close > currentPrice.open) {
        const positionSize = Math.min(30, 15 + trendStrength * 500); // 15-30% je nach Trendstärke
        return { 
          action: 'BUY', 
          sizePercent: positionSize, 
          reason: `Strong uptrend: ${(avgTrend * 100).toFixed(2)}% avg over 6h` 
        };
      }
    }
    
    return { action: 'HOLD', sizePercent: 0, reason: 'No clear trend signal' };
  }
  
  /**
   * Dip-Hunter Bot Strategie: Kauft Dips und verkauft bei Recovery
   */
  private dipHunterStrategy(
    token: RealTokenData,
    currentPrice: PriceData,
    priceHistory: (PriceData & { tokenAddress: string })[],
    currentPosition?: { amount: number; entryPrice: number; entryTime: number }
  ): { action: 'BUY' | 'SELL' | 'HOLD'; sizePercent: number; reason: string } {
    
    if (priceHistory.length < 8) {
      return { action: 'HOLD', sizePercent: 0, reason: 'Insufficient data' };
    }
    
    // Finde lokales Maximum der letzten 8 Stunden
    const recentPrices = priceHistory.slice(-8);
    const maxPrice = Math.max(...recentPrices.map(p => p.high));
    const currentDipPercent = (currentPrice.close - maxPrice) / maxPrice;
    
    // VERKAUFS-Logik
    if (currentPosition) {
      const priceChange = (currentPrice.close - currentPosition.entryPrice) / currentPosition.entryPrice;
      const timeSinceEntry = (currentPrice.timestamp - currentPosition.entryTime) / (1000 * 60 * 60);
      
      // Verkaufe bei 8% Gewinn ODER 6% Stop-Loss ODER nach 16 Stunden
      if (priceChange > 0.08 || priceChange < -0.06 || timeSinceEntry > 16) {
        return { 
          action: 'SELL', 
          sizePercent: 100, 
          reason: `Recovery target hit or stop-loss (${(priceChange * 100).toFixed(2)}%)` 
        };
      }
    }
    
    // KAUF-Logik
    if (!currentPosition) {
      // Kaufe bei signifikanten Dips
      if (currentDipPercent < -0.15 && currentPrice.volume > token.volume24h / 24 * 1.5) {
        const dipSeverity = Math.abs(currentDipPercent);
        const positionSize = Math.min(35, 20 + dipSeverity * 100); // 20-35% je nach Dip-Schwere
        return { 
          action: 'BUY', 
          sizePercent: positionSize, 
          reason: `Significant dip: ${(currentDipPercent * 100).toFixed(2)}% from recent high` 
        };
      }
      
      // Kaufe auch bei kleineren Dips mit hohem Volumen
      if (currentDipPercent < -0.08 && currentPrice.volume > token.volume24h / 24 * 2.0) {
        return { 
          action: 'BUY', 
          sizePercent: 15, 
          reason: `Medium dip with high volume: ${(currentDipPercent * 100).toFixed(2)}%` 
        };
      }
    }
    
    return { action: 'HOLD', sizePercent: 0, reason: 'No dip opportunity' };
  }
  
  /**
   * Berechnet aktuellen Portfolio-Wert (Cash + Positionen)
   */
  private calculatePortfolioValue(
    cash: number,
    positions: Map<string, { amount: number; entryPrice: number; entryTime: number }>,
    allPrices: (PriceData & { tokenAddress: string })[],
    currentIndex: number
  ): number {
    let totalValue = cash;
    
    // Addiere Wert aller offenen Positionen
    positions.forEach((position, tokenAddress) => {
      // Finde aktuellen Preis für diesen Token
      for (let i = currentIndex; i >= 0; i--) {
        if (allPrices[i].tokenAddress === tokenAddress) {
          totalValue += position.amount * allPrices[i].close;
          break;
        }
      }
    });
    
    return totalValue;
  }
  
  /**
   * Normalisiert Bot-ID für konsistente Strategie-Zuordnung
   */
  private normalizeBotId(botType: string): string {
    const botTypeLower = botType.toLowerCase();
    if (botTypeLower.includes('volume') || botTypeLower.includes('tracker')) return 'volume-tracker';
    if (botTypeLower.includes('trend') || botTypeLower.includes('surfer') || botTypeLower.includes('momentum')) return 'trend-surfer';
    if (botTypeLower.includes('dip') || botTypeLower.includes('hunter') || botTypeLower.includes('arb')) return 'dip-hunter';
    return 'volume-tracker';
  }
  
  /**
   * Fallback für tägliche Daten wenn keine historischen Daten verfügbar
   */
  private generateFallbackDailyData(): { date: string; value: number }[] {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        value: 100 + (Math.random() - 0.5) * 10 // ±5% Random
      });
    }
    return data;
  }
  
  /**
   * Verarbeitet Pump.fun Token-Daten
   */
  private async processPumpToken(token: any): Promise<RealTokenData | null> {
    try {
      return {
        address: token.mint,
        symbol: token.symbol,
        name: token.name,
        price: token.usd_market_cap / token.total_supply,
        priceChange24h: Math.random() * 200 - 100, // -100% bis +100%
        volume24h: Math.random() * 1000000,
        marketCap: token.usd_market_cap,
        liquidityPool: Math.random() * 500000,
        holders: Math.floor(Math.random() * 10000),
        trades24h: Math.floor(Math.random() * 1000),
        dexes: ['Pump.fun', 'Raydium'],
        createdAt: new Date(token.created_timestamp).toISOString()
      };
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Verarbeitet DexScreener Pair-Daten
   */
  private async processDexPair(pair: any): Promise<RealTokenData | null> {
    try {
      return {
        address: pair.baseToken.address,
        symbol: pair.baseToken.symbol,
        name: pair.baseToken.name,
        price: parseFloat(pair.priceUsd || '0'),
        priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
        volume24h: parseFloat(pair.volume?.h24 || '0'),
        marketCap: parseFloat(pair.fdv || '0'),
        liquidityPool: parseFloat(pair.liquidity?.usd || '0'),
        holders: Math.floor(Math.random() * 5000),
        trades24h: parseFloat(pair.txns?.h24?.buys || '0') + parseFloat(pair.txns?.h24?.sells || '0'),
        dexes: [pair.dexId],
        createdAt: new Date(pair.pairCreatedAt).toISOString()
      };
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Generiert neue Memecoins als Fallback mit realistischen Eigenschaften
   */
  private async generateFallbackNewMemecoins(count: number): Promise<RealTokenData[]> {
    const newMemecoins: RealTokenData[] = [];
    for (let i = 0; i < count; i++) {
      const uniqueAddress = `FallB${i}ToKeN${Date.now().toString().slice(-8)}${Math.random().toString(36).substring(2, 7)}`;
      const ageHours = Math.floor(Math.random() * 23) + 1; // 1-23 Stunden alt
      const marketCap = 50000 + Math.random() * 950000; // 50k - 1M Market Cap
      const price = marketCap / (100000000 + Math.random() * 900000000); // Zufällige Supply
      
      newMemecoins.push({
        address: uniqueAddress,
        symbol: `NEWCOIN${i + 1}`,
        name: `New Memecoin ${i + 1}`,
        price: price,
        priceChange24h: (Math.random() - 0.5) * 300, // -150% bis +150% Volatilität
        volume24h: marketCap * (0.2 + Math.random() * 0.8), // 20%-100% des MC als Volume
        marketCap: marketCap,
        liquidityPool: marketCap * (0.1 + Math.random() * 0.3), // 10%-40% des MC als Liquidity
        holders: 50 + Math.floor(Math.random() * 1000),
        trades24h: 100 + Math.floor(Math.random() * 2000),
        dexes: ['Raydium'],
        createdAt: new Date(Date.now() - ageHours * 60 * 60 * 1000).toISOString()
      });
    }
    return newMemecoins;
  }
  
  /**
   * Generiere realistische 7-Tage Preishistorie für neue Memecoins
   */
  private generateNewMemecoinHistory(token: RealTokenData): PriceData[] {
    const history: PriceData[] = [];
    const now = Date.now();
    const startTime = now - (7 * 24 * 60 * 60 * 1000); // 7 Tage zurück
    
    let currentPrice = token.price * 0.1; // Startete bei 10% des aktuellen Preises
    
    // Generiere stündliche Daten für 7 Tage
    for (let i = 0; i < 7 * 24; i++) {
      const timestamp = startTime + (i * 60 * 60 * 1000); // Jede Stunde
      
      // Simuliere realistische Memecoin-Bewegungen
      let priceChange = 0;
      
      // 20% Chance auf große Bewegungen (Pumps/Dumps)
      if (Math.random() < 0.2) {
        priceChange = (Math.random() - 0.5) * 0.8; // ±40% große Bewegung
      } else {
        priceChange = (Math.random() - 0.5) * 0.1; // ±5% normale Bewegung
      }
      
      currentPrice *= (1 + priceChange);
      
      // Volume-Spikes bei großen Preisbewegungen
      const baseVolume = token.volume24h / 24; // Durchschnittliches Stunden-Volume
      const volumeMultiplier = Math.abs(priceChange) > 0.1 ? 3 + Math.random() * 5 : 0.5 + Math.random() * 1.5;
      const hourlyVolume = baseVolume * volumeMultiplier;
      
      // OHLC für die Stunde
      const open = currentPrice / (1 + priceChange);
      const close = currentPrice;
      const high = Math.max(open, close) * (1 + Math.random() * 0.05);
      const low = Math.min(open, close) * (1 - Math.random() * 0.05);
      
      history.push({
        timestamp,
        open,
        high,
        low,
        close,
        volume: hourlyVolume
      });
    }
    
    return history;
  }
}

/**
 * Hauptfunktion für echte Token-Simulation
 */
export async function simulateRealTokenTrading(
  botType: string,
  tokenCount: number = 10
): Promise<{
  profitPercentage: number;
  tradeCount: number;
  successRate: number;
  dailyData: { date: string; value: number }[];
  tokens: RealTokenData[];
  dataSource: 'real-api';
}> {
  const simulator = new RealTokenSimulator();
  return await simulator.simulateWithRealData(botType, tokenCount);
} 