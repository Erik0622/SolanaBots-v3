/**
 * Bitquery API für Solana Memecoin-Daten
 * Speziell für neue Token nach Raydium-Migration
 */

export interface BitqueryToken {
  address: string;
  symbol: string;
  name: string;
  marketCap: number;
  volume24h: number;
  raydiumLaunchTime: number;
  age: number; // in Stunden
  priceHistory: BitqueryPriceData[];
  volatility?: number; // Hinzugefügt für bessere Filterung
  priceChange24h?: number; // Hinzugefügt für Volatilitätsmessung
}

export interface BitqueryPriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BitqueryMigrationData {
  tokenAddress: string;
  migrationTime: number;
  pumpFunLaunchTime?: number;
  raydiumPairAddress: string;
}

export class BitqueryAPI {
  private baseUrl = 'https://graphql.bitquery.io';
  private apiKey = process.env.BITQUERY_API_KEY || 'ory_at_4t1KnHlwObAx_MVV5xuXlHRa86VmpiA7KhJjNLyC9MQ.-3tIZhQyT8xbIf5EQnt2e8GLnux0pFAwyl1uCVzZQZg';
  private projectId = process.env.BITQUERY_PROJECT_ID || '0aeb55a3-7c07-4eb2-8672-3e33cbe428a2';
  private secret = process.env.BITQUERY_SECRET || 'A3pO89GykmVdSiAqvJvQfsiILK';
  private lastRequestTime = 0;
  private requestCount = 0;
  private readonly rateLimitDelay = 6000; // 6 Sekunden zwischen Requests (10/min = 1 pro 6s)

  constructor() {
    if (!this.apiKey) {
      console.warn('⚠️  Bitquery API Key fehlt! Bitte BITQUERY_API_KEY in .env.local setzen');
    }
    console.log(`🔗 Bitquery API initialisiert für Projekt: ${this.projectId}`);
  }

  /**
   * Rate-Limit-Management: Wartet mindestens 6 Sekunden zwischen Requests
   */
  private async handleRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest;
      console.log(`⏳ Rate Limit: Warte ${(waitTime / 1000).toFixed(1)}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
    this.requestCount++;
    console.log(`📊 Bitquery Request #${this.requestCount}`);
  }

  /**
   * Findet neue Memecoins die nach Raydium migriert sind
   * Filter: < 24h alt, > 50k Market Cap, 25min nach Launch
   * NUR ECHTE BITQUERY-DATEN - KEINE MOCK-SIMULATIONEN!
   */
  async getNewRaydiumMemecoins(limit: number = 20): Promise<BitqueryToken[]> {
    console.log('🔍 Searching for REAL new Raydium-migrated tokens <24h - NO MOCK DATA!');
    
    try {
      // NUR ECHTE BITQUERY API - Keine Fallbacks zu Mock-Daten
      const realTokens = await this.getBitqueryTokens(limit);
      
      if (realTokens.length === 0) {
        console.error('❌ KEINE ECHTEN TOKEN GEFUNDEN! Bitquery API Problem - Details in Logs');
        throw new Error('Keine echten neuen Raydium-Token gefunden. API-Problem!');
      }
      
      console.log(`✅ ${realTokens.length} ECHTE neue Raydium-Token <24h gefunden (KEINE MOCK-DATEN)`);
      return realTokens;
      
    } catch (error) {
      console.error('❌ BITQUERY API FEHLGESCHLAGEN:', error);
      
      // KEINE Mock-Fallbacks mehr! User will nur echte Daten
      throw new Error(`Bitquery API für echte Token fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  }

  /**
   * ECHTE Bitquery API für neue Raydium-Token <24h - KEINE MOCK-DATEN!
   */
  private async getBitqueryTokens(limit: number): Promise<BitqueryToken[]> {
    // Erweiterte Query für bessere Token-Erkennung
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const query = `
      query NewRaydiumTokens24h {
        Solana {
          DEXTrades(
            where: {
              Trade: {
                Dex: { 
                  ProtocolName: { in: ["Raydium", "raydium", "Raydium V4", "Raydium CLMM"] } 
                }
                Currency: { 
                  MintAddress: { 
                    notIn: [
                      "So11111111111111111111111111111111111111112",
                      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                      "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
                      "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"
                    ]
                  }
                }
              }
              Transaction: { Result: { Success: true } }
              Block: { 
                Time: { 
                  since: "${since24h}"
                }
              }
            }
            orderBy: { descending: Block_Time }
            limit: { count: ${limit * 5} }
          ) {
            Trade {
              Currency {
                MintAddress
                Symbol
                Name
              }
              Market {
                MarketAddress
              }
              Dex {
                ProtocolName
              }
              Price
              AmountInUSD
              Amount
            }
            Block {
              Time
              Height
            }
            count(uniq: transactions)
          }
        }
      }
    `;

    try {
      console.log(`🔍 Suche nach ECHTEN neuen Raydium-Token <24h über Bitquery API...`);
      console.log(`📅 Zeitraum: ${since24h} bis jetzt`);
      await this.handleRateLimit();
      
      const response = await this.executeQuery(query);
      
      if (!response?.data?.Solana?.DEXTrades) {
        console.error('❌ BITQUERY API PROBLEM: Keine DEXTrades in Response');
        console.error('Response structure:', JSON.stringify(response, null, 2));
        throw new Error('Bitquery API liefert keine DEXTrades-Daten');
      }

      const trades = response.data.Solana.DEXTrades;
      console.log(`📊 ${trades.length} rohe Bitquery-Trades erhalten, filtere nach neuen Token...`);
      
      if (trades.length === 0) {
        console.error('❌ KEINE TRADES: Bitquery API hat keine Raydium-Trades in den letzten 24h gefunden');
        throw new Error('Keine neuen Raydium-Trades in den letzten 24h verfügbar');
      }

      const tokenMap = new Map<string, any>();

      // Gruppiere Trades nach Token und sammle Statistiken
      trades.forEach((trade: any, index: number) => {
        try {
          const address = trade.Trade?.Currency?.MintAddress;
          const symbol = trade.Trade?.Currency?.Symbol;
          const name = trade.Trade?.Currency?.Name;
          const blockTime = trade.Block?.Time;
          const amountUSD = parseFloat(trade.Trade?.AmountInUSD) || 0;
          
          if (!address || !blockTime) {
            console.warn(`⚠️  Trade ${index} hat unvollständige Daten:`, { address, blockTime, symbol });
            return;
          }

          if (!tokenMap.has(address)) {
            tokenMap.set(address, {
              address,
              symbol: symbol || 'UNKNOWN',
              name: name || 'Unknown Token',
              firstTradeTime: blockTime,
              lastTradeTime: blockTime,
              trades: [],
              totalVolume: 0,
              totalTrades: 0,
              dexProtocols: new Set()
            });
          }
          
          const token = tokenMap.get(address);
          token.trades.push(trade);
          token.totalVolume += amountUSD;
          token.totalTrades++;
          token.dexProtocols.add(trade.Trade?.Dex?.ProtocolName);
          
          // Update Zeitfenster
          const tradeTime = new Date(blockTime).getTime();
          const firstTime = new Date(token.firstTradeTime).getTime();
          const lastTime = new Date(token.lastTradeTime).getTime();
          
          if (tradeTime < firstTime) {
            token.firstTradeTime = blockTime;
          }
          if (tradeTime > lastTime) {
            token.lastTradeTime = blockTime;
          }
        } catch (tradeError) {
          console.warn(`⚠️  Fehler beim Verarbeiten von Trade ${index}:`, tradeError);
        }
      });

      console.log(`🔍 ${tokenMap.size} eindeutige Token gefunden, wende Filter an...`);

      const filteredTokens: BitqueryToken[] = [];
      
      // Wende strenge Filter für neue Token an
      for (const [address, tokenData] of tokenMap.entries()) {
        try {
          const firstTradeTime = new Date(tokenData.firstTradeTime).getTime();
          const ageHours = (Date.now() - firstTradeTime) / (1000 * 60 * 60);
          const estimatedMarketCap = tokenData.totalVolume * 15; // Konservativere Schätzung
          const volume24h = tokenData.totalVolume;
          
          console.log(`🔍 Prüfe Token ${tokenData.symbol}:`);
          console.log(`   📅 Alter: ${ageHours.toFixed(2)}h`);
          console.log(`   💰 Est. MCap: $${estimatedMarketCap.toLocaleString()}`);
          console.log(`   📊 Volume 24h: $${volume24h.toLocaleString()}`);
          console.log(`   🔄 Trades: ${tokenData.totalTrades}`);
          console.log(`   🏦 DEX: ${Array.from(tokenData.dexProtocols).join(', ')}`);

          // Strenge Filter: <24h, >50k MCap, min 30min nach Launch, min 10 Trades
          if (
            ageHours <= 24 && 
            ageHours >= 0.5 && // 30min mindestens
            estimatedMarketCap >= 50000 && 
            tokenData.totalTrades >= 10 && // Min 10 echte Trades
            volume24h >= 5000 // Min $5k Volume
          ) {
            console.log(`✅ Token ${tokenData.symbol} QUALIFIZIERT für Backtesting`);
            
            try {
              // Hole echte Preishistorie über Bitquery
              console.log(`📈 Lade echte Preishistorie für ${tokenData.symbol}...`);
              const priceHistory = await this.get5MinutePriceHistory(address, firstTradeTime);
              
              if (priceHistory.length === 0) {
                console.warn(`⚠️  Keine Preishistorie für ${tokenData.symbol} verfügbar - überspringe`);
                continue;
              }

              // Berechne echte Volatilität aus echten Daten
              const volatility = this.calculateRealVolatility(priceHistory);
              const priceChange24h = ((priceHistory[priceHistory.length - 1].close - priceHistory[0].open) / priceHistory[0].open) * 100;

              console.log(`📊 ${tokenData.symbol} Volatilität: ${volatility.toFixed(1)}%, Preisänderung: ${priceChange24h.toFixed(1)}%`);

              filteredTokens.push({
                address,
                symbol: tokenData.symbol,
                name: tokenData.name,
                marketCap: estimatedMarketCap,
                volume24h,
                raydiumLaunchTime: firstTradeTime,
                age: ageHours,
                priceHistory,
                volatility,
                priceChange24h
              });

              console.log(`✅ Token ${tokenData.symbol} mit ${priceHistory.length} echten Candles hinzugefügt`);

              // Begrenze auf gewünschte Anzahl
              if (filteredTokens.length >= limit) {
                console.log(`🎯 Gewünschte Anzahl von ${limit} Token erreicht`);
                break;
              }
              
            } catch (historyError) {
              console.error(`❌ Fehler beim Laden der Preishistorie für ${tokenData.symbol}:`, historyError);
              // Überspringe Token ohne gültige Historie
              continue;
            }
          } else {
            console.log(`❌ Token ${tokenData.symbol} NICHT qualifiziert:`);
            if (ageHours > 24) console.log(`   ❌ Zu alt: ${ageHours.toFixed(2)}h`);
            if (ageHours < 0.5) console.log(`   ❌ Zu jung: ${ageHours.toFixed(2)}h`);
            if (estimatedMarketCap < 50000) console.log(`   ❌ MCap zu niedrig: $${estimatedMarketCap.toLocaleString()}`);
            if (tokenData.totalTrades < 10) console.log(`   ❌ Zu wenig Trades: ${tokenData.totalTrades}`);
            if (volume24h < 5000) console.log(`   ❌ Volume zu niedrig: $${volume24h.toLocaleString()}`);
          }
        } catch (tokenError) {
          console.error(`❌ Fehler beim Verarbeiten von Token ${address}:`, tokenError);
          continue;
        }
      }

      console.log(`🎯 ERGEBNIS: ${filteredTokens.length} echte neue Raydium-Token <24h mit vollständiger Preishistorie`);
      
      if (filteredTokens.length === 0) {
        console.error('❌ KEINE QUALIFIZIERTEN TOKEN: Alle gefundenen Token erfüllen nicht die Mindestanforderungen');
        console.error('Anforderungen: <24h alt, >$50k MCap, min 30min nach Launch, min 10 Trades, min $5k Volume');
        throw new Error('Keine neuen Raydium-Token erfüllen die Mindestanforderungen für echtes Backtesting');
      }

      return filteredTokens;

    } catch (error) {
      console.error('❌ BITQUERY TOKEN DISCOVERY FEHLGESCHLAGEN:', error);
      
      if (error instanceof Error) {
        console.error('Error Details:', {
          message: error.message,
          stack: error.stack
        });
      }
      
      throw new Error(`Bitquery neue Token Discovery fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  }

  /**
   * Berechnet echte Volatilität aus echten Bitquery-Preisdaten
   */
  private calculateRealVolatility(priceHistory: BitqueryPriceData[]): number {
    if (priceHistory.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < priceHistory.length; i++) {
      const return_ = (priceHistory[i].close - priceHistory[i-1].close) / priceHistory[i-1].close;
      returns.push(Math.abs(return_));
    }
    
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    // Annualisierte tägliche Volatilität
    return avgReturn * 100 * Math.sqrt(288); // 288 = 24h * 12 (5min intervals)
  }

  /**
   * Holt 5-Minuten-OHLCV-Daten für einen Token ab dem Launch-Zeitpunkt
   * NUR ECHTE BITQUERY-DATEN - KEINE MOCK-SIMULATIONEN!
   */
  async get5MinutePriceHistory(
    tokenAddress: string, 
    startTime: number,
    hours: number = 24 // Erweitere auf 24h für mehr echte Daten
  ): Promise<BitqueryPriceData[]> {
    
    const endTime = Math.min(startTime + (hours * 60 * 60 * 1000), Date.now());

    const query = `
      query Token5MinuteHistory {
        Solana {
          DEXTrades(
            where: {
              Trade: {
                Currency: { MintAddress: { is: "${tokenAddress}" } }
                Side: { 
                  Currency: { 
                    MintAddress: { is: "So11111111111111111111111111111111111111112" }
                  }
                }
              }
              Transaction: { Result: { Success: true } }
              Block: {
                Time: {
                  since: "${new Date(startTime).toISOString()}"
                  till: "${new Date(endTime).toISOString()}"
                }
              }
            }
            orderBy: { ascending: Block_Time }
            limit: { count: 288 } // 24h * 12 (5min Intervalle) = 288 Candles max
          ) {
            Block {
              Time
            }
            Trade {
              Price
              Amount
              AmountInUSD
            }
          }
        }
      }
    `;

    try {
      console.log(`📈 Lade ECHTE Bitquery 5min-Historie für Token: ${tokenAddress.slice(0, 8)}... (${new Date(startTime).toLocaleString()} - ${new Date(endTime).toLocaleString()})`);
      await this.handleRateLimit();
      
      const response = await this.executeQuery(query);
      
      if (!response?.data?.Solana?.DEXTrades) {
        console.error(`❌ BITQUERY API FEHLER: Keine Trade-Daten für ${tokenAddress} erhalten`);
        throw new Error(`Keine echten Bitquery-Daten für Token ${tokenAddress} verfügbar`);
      }

      const trades = response.data.Solana.DEXTrades;
      
      if (trades.length === 0) {
        console.error(`❌ KEINE ECHTEN TRADES: Token ${tokenAddress.slice(0, 8)} hat keine Trade-Historie in Bitquery`);
        throw new Error(`Token ${tokenAddress} hat keine echte Trade-Historie zwischen ${new Date(startTime).toLocaleString()} und ${new Date(endTime).toLocaleString()}`);
      }

      console.log(`📊 ${trades.length} ECHTE Bitquery-Trades für ${tokenAddress.slice(0, 8)} gefunden`);

      // Konvertiere Trade-Daten zu OHLCV-Candles (echte Daten!)
      const candles: BitqueryPriceData[] = [];
      
      // Gruppiere Trades in 5-Minuten-Intervalle
      const intervals = new Map<number, any[]>();
      
      trades.forEach((trade: any) => {
        const timestamp = new Date(trade.Block.Time).getTime();
        const intervalStart = Math.floor(timestamp / (5 * 60 * 1000)) * (5 * 60 * 1000);
        
        if (!intervals.has(intervalStart)) {
          intervals.set(intervalStart, []);
        }
        intervals.get(intervalStart)!.push(trade);
      });

      // Erstelle OHLCV-Candles aus echten Bitquery-Trades
      for (const [intervalStart, intervalTrades] of intervals) {
        if (intervalTrades.length === 0) continue;
        
        const prices = intervalTrades.map(t => parseFloat(t.Trade.Price));
        const volumes = intervalTrades.map(t => parseFloat(t.Trade.Amount) || 0);
        const volumesUSD = intervalTrades.map(t => parseFloat(t.Trade.AmountInUSD) || 0);
        
        candles.push({
          timestamp: intervalStart,
          open: prices[0],
          high: Math.max(...prices),
          low: Math.min(...prices),
          close: prices[prices.length - 1],
          volume: Math.max(volumes.reduce((sum, v) => sum + v, 0), volumesUSD.reduce((sum, v) => sum + v, 0))
        });
      }

      // Sortiere Candles chronologisch
      candles.sort((a, b) => a.timestamp - b.timestamp);

      console.log(`✅ ${candles.length} ECHTE 5-Minuten-Candles für ${tokenAddress.slice(0, 8)} erstellt (KEINE MOCK-DATEN)`);
      
      if (candles.length === 0) {
        console.error(`❌ KEINE CANDLES ERSTELLT: Trotz ${trades.length} Trades konnten keine 5min-Candles für ${tokenAddress} erstellt werden`);
        throw new Error(`Keine 5-Minuten-Candles aus ${trades.length} echten Trades erstellbar`);
      }

      return candles;

    } catch (error) {
      console.error(`❌ Bitquery History Fehler für ${tokenAddress}:`, error);
      
      // KEINE Mock-Fallbacks! User will nur echte Daten
      throw new Error(`Bitquery 5min-Historie für ${tokenAddress} fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  }

  /**
   * Prüft ob ein Token von Pump.fun nach Raydium migriert ist
   */
  async checkPumpFunMigration(tokenAddress: string): Promise<BitqueryMigrationData | null> {
    const query = `
      query CheckMigration {
        Solana {
          DEXTrades(
            where: {
              Trade: { Currency: { MintAddress: { is: "${tokenAddress}" } } }
              Transaction: { Result: { Success: true } }
            }
            orderBy: { ascending: Block_Time }
            limit: { count: 10 }
          ) {
            Block {
              Time
            }
            Trade {
              Dex {
                ProtocolName
              }
              Market {
                MarketAddress
              }
            }
          }
        }
      }
    `;

    try {
      await this.handleRateLimit();
      const response = await this.executeQuery(query);
      
      if (!response?.data?.Solana?.DEXTrades) {
        return null;
      }

      const trades = response.data.Solana.DEXTrades;
      let pumpFunTime: number | undefined;
      let raydiumTime: number | undefined;
      let raydiumPair = '';

      for (const trade of trades) {
        const time = new Date(trade.Block.Time).getTime();
        const protocol = trade.Trade.Dex.ProtocolName.toLowerCase();

        if (protocol.includes('pump') && !pumpFunTime) {
          pumpFunTime = time;
        }
        if (protocol.includes('raydium') && !raydiumTime) {
          raydiumTime = time;
          raydiumPair = trade.Trade.Market.MarketAddress;
        }
      }

      if (raydiumTime) {
        return {
          tokenAddress,
          migrationTime: raydiumTime,
          pumpFunLaunchTime: pumpFunTime,
          raydiumPairAddress: raydiumPair
        };
      }

      return null;

    } catch (error) {
      console.error(`❌ Bitquery Migration Check Fehler für ${tokenAddress}:`, error);
      return null;
    }
  }

  /**
   * Führt eine GraphQL-Query aus
   */
  private async executeQuery(query: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Bitquery API Key erforderlich');
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    };

    // Füge X-API-KEY hinzu falls vorhanden
    if (this.secret) {
      headers['X-API-KEY'] = this.secret;
    }

    console.log('🔗 Sende Bitquery GraphQL Request...');

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ 
        query,
        variables: {},
        operationName: null
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Bitquery API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL Errors:', data.errors);
      throw new Error(`GraphQL Errors: ${JSON.stringify(data.errors)}`);
    }

    console.log('✅ Bitquery API Response erfolgreich erhalten');
    return data;
  }

  /**
   * Test-Funktion für API-Verbindung
   */
  async testConnection(): Promise<boolean> {
    const testQuery = `
      query TestConnection {
        Solana {
          DEXTrades(limit: { count: 1 }) {
            Block {
              Time
            }
            Trade {
              Dex {
                ProtocolName
              }
            }
          }
        }
      }
    `;

    try {
      console.log('🧪 Teste Bitquery API Verbindung...');
      await this.handleRateLimit();
      const response = await this.executeQuery(testQuery);
      
      if (response?.data?.Solana?.DEXTrades) {
        console.log('✅ Bitquery API Verbindung erfolgreich');
        return true;
      } else {
        console.error('❌ Unerwartete Antwort von Bitquery API');
        return false;
      }
    } catch (error) {
      console.error('❌ Bitquery API Verbindung fehlgeschlagen:', error);
      return false;
    }
  }
} 