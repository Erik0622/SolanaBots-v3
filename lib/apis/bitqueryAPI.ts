/**
 * DexScreener API für Solana Memecoin-Daten
 * KEINE API-KEYS ERFORDERLICH - Öffentliche API
 * Rate Limit: 300 requests/minute
 */

import axios from 'axios';

interface RaydiumTrade {
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  priceUSD: number;
  volumeUSD24h: number;
  priceChange24h: number;
  liquidityUSD: number;
  trades24h: number;
  timestamp: string;
}

export class BitqueryAPI {
  private rateLimitDelay = 300; // 300ms = 200 requests/minute (unter 300 limit)

  constructor() {
    // KEINE API-KEYS BENÖTIGT! 🎉
    console.log('🎯 DexScreener API initialisiert - KEINE API-KEYS erforderlich!');
  }

  /**
   * Rate Limiting für DexScreener (viel weniger restriktiv)
   */
  private async handleRateLimit(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
  }

  /**
   * HAUPTFUNKTION: Holt aktuelle Raydium-Token-Daten von DexScreener
   * Verwendet verschiedene Suchstrategien für maximale Token-Abdeckung
   */
  async getEnhancedRaydiumTokens(): Promise<RaydiumTrade[]> {
    try {
      console.log('🔄 Lade Raydium Token-Daten von DexScreener API...');
      
      await this.handleRateLimit();
      
      // STRATEGIE 1: Suche nach beliebten Solana-Token
      const popularTokens = ['SOL', 'BONK', 'USDC', 'USDT', 'JUP', 'WIF', 'PEPE'];
      const allTokens: RaydiumTrade[] = [];
      
      for (const token of popularTokens) {
        try {
          console.log(`🔍 Suche nach ${token}-Pairs...`);
          await this.handleRateLimit(); // Rate limiting zwischen Requests
          
          const response = await axios.get(`https://api.dexscreener.com/latest/dex/search?q=${token}`, {
            timeout: 15000,
            headers: {
              'User-Agent': 'Solana-Trading-Bot/1.0'
            }
          });

          if (response.data?.pairs) {
            // Filter für Solana Raydium-Pairs
            const raydiumPairs = response.data.pairs.filter((pair: any) => {
              const isSolana = pair.chainId === 'solana';
              const isRaydium = pair.dexId === 'raydium';
              const hasPrice = pair.priceUsd && parseFloat(pair.priceUsd) > 0;
              const hasVolume = pair.volume?.h24 && parseFloat(pair.volume.h24) > 100; // Min $100 Volume
              const hasLiquidity = pair.liquidity?.usd && parseFloat(pair.liquidity.usd) > 500; // Min $500 Liquidität
              const hasTokens = pair.baseToken && pair.quoteToken;
              
              return isSolana && isRaydium && hasPrice && hasVolume && hasLiquidity && hasTokens;
            });

            console.log(`📊 ${token}: ${raydiumPairs.length} Raydium-Pairs gefunden`);
            
            // Konvertiere zu Trading-Format
            const tokenData = raydiumPairs.map((pair: any): RaydiumTrade => {
              const buys = parseInt(pair.txns?.h24?.buys || '0');
              const sells = parseInt(pair.txns?.h24?.sells || '0');
              
              return {
                tokenAddress: pair.baseToken.address,
                tokenName: pair.baseToken.name || 'Unknown Token',
                tokenSymbol: pair.baseToken.symbol || 'UNKNOWN',
                priceUSD: parseFloat(pair.priceUsd || '0'),
                volumeUSD24h: parseFloat(pair.volume?.h24 || '0'),
                priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
                liquidityUSD: parseFloat(pair.liquidity?.usd || '0'),
                trades24h: buys + sells,
                timestamp: new Date().toISOString(),
              };
            });
            
            allTokens.push(...tokenData);
          }
        } catch (tokenError) {
          console.error(`❌ Fehler bei ${token}-Suche:`, tokenError instanceof Error ? tokenError.message : 'Unbekannt');
        }
      }
      
      // STRATEGIE 2: Spezifische Token-Pairs für bekannte High-Volume-Token
      try {
        console.log('🔍 Lade spezifische SOL-Pairs...');
        await this.handleRateLimit();
        
        const solAddress = 'So11111111111111111111111111111111111111112'; // Wrapped SOL
        const solResponse = await axios.get(`https://api.dexscreener.com/token-pairs/v1/solana/${solAddress}`, {
          timeout: 15000,
          headers: {
            'User-Agent': 'Solana-Trading-Bot/1.0'
          }
        });

        if (Array.isArray(solResponse.data)) {
          const solRaydiumPairs = solResponse.data.filter((pair: any) => 
            pair.dexId === 'raydium' && 
            pair.volume?.h24 && parseFloat(pair.volume.h24) > 1000 &&
            pair.liquidity?.usd && parseFloat(pair.liquidity.usd) > 1000
          );
          
          console.log(`📊 SOL-specific: ${solRaydiumPairs.length} high-volume Pairs`);
          
          const solTokenData = solRaydiumPairs.map((pair: any): RaydiumTrade => {
            const buys = parseInt(pair.txns?.h24?.buys || '0');
            const sells = parseInt(pair.txns?.h24?.sells || '0');
            
            return {
              tokenAddress: pair.baseToken.address,
              tokenName: pair.baseToken.name || 'Unknown Token',
              tokenSymbol: pair.baseToken.symbol || 'UNKNOWN',
              priceUSD: parseFloat(pair.priceUsd || '0'),
              volumeUSD24h: parseFloat(pair.volume?.h24 || '0'),
              priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
              liquidityUSD: parseFloat(pair.liquidity?.usd || '0'),
              trades24h: buys + sells,
              timestamp: new Date().toISOString(),
            };
          });
          
          allTokens.push(...solTokenData);
        }
      } catch (solError) {
        console.error('❌ SOL-spezifische Suche fehlgeschlagen:', solError instanceof Error ? solError.message : 'Unbekannt');
      }
      
      // Deduplizierung basierend auf Token-Adresse
      const uniqueTokens = allTokens.filter((token, index, self) => 
        index === self.findIndex(t => t.tokenAddress === token.tokenAddress)
      );
      
      // Sortiere nach Volume (absteigend)
      uniqueTokens.sort((a, b) => b.volumeUSD24h - a.volumeUSD24h);
      
      // Nehme die Top 50 für bessere Performance
      const topTokens = uniqueTokens.slice(0, 50);
      
      console.log(`✅ ${topTokens.length} einzigartige Token geladen (dedupliziert von ${allTokens.length})`);
      
      // Debug: Zeige Top 5 Token
      topTokens.slice(0, 5).forEach((trade, i) => {
        console.log(`${i + 1}. ${trade.tokenSymbol}: $${trade.priceUSD.toFixed(6)}, Vol: $${trade.volumeUSD24h.toLocaleString()}`);
      });

      return topTokens;

    } catch (error) {
      console.error('❌ DexScreener API Fehler:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('DexScreener API Timeout - versuchen Sie es erneut');
        }
        if (error.response?.status === 429) {
          throw new Error('DexScreener Rate Limit erreicht - warten Sie kurz');
        }
        if (error.response?.status) {
          throw new Error(`DexScreener API HTTP ${error.response.status}: ${error.response.statusText}`);
        }
      }
      
      throw new Error(`DexScreener API fehlgeschlagen: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  }

  /**
   * Debug-Funktion für DexScreener API
   */
  async debugAPIConfig(): Promise<void> {
    console.log('🔧 === DEXSCREENER API KONFIGURATION ===');
    console.log('URL: https://api.dexscreener.com/');
    console.log('API Key benötigt: NEIN! 🎉');
    console.log('Rate Limit: 300 requests/minute');
    console.log('Dokumentation: https://docs.dexscreener.com/');
    console.log('Strategien: Multi-Token-Suche + spezifische Token-Pairs');
  }

  /**
   * Test-Funktion für DexScreener API
   */
  async testConnection(): Promise<boolean> {
    console.log('🧪 === DEXSCREENER API CONNECTION TEST ===');
    
    try {
      console.log('🔍 Teste DexScreener API Verfügbarkeit...');
      
      await this.handleRateLimit();
      
      const response = await axios.get('https://api.dexscreener.com/latest/dex/search?q=SOL', {
        timeout: 10000
      });

      console.log(`📊 Status: ${response.status}`);
      console.log(`📈 Pairs erhalten: ${response.data?.pairs?.length || 0}`);
      
      if (response.data?.pairs && response.data.pairs.length > 0) {
        const raydiumCount = response.data.pairs.filter((p: any) => p.dexId === 'raydium').length;
        console.log(`🎯 Raydium Pairs: ${raydiumCount}`);
        
        console.log('✅ DexScreener API funktioniert perfekt!');
        return true;
      } else {
        console.log('❌ DexScreener API antwortet, aber ohne Daten');
        return false;
      }
      
    } catch (error) {
      console.error('❌ DexScreener API Test fehlgeschlagen:', error);
      
      if (axios.isAxiosError(error)) {
        console.log(`HTTP Status: ${error.response?.status || 'N/A'}`);
        console.log(`Error Code: ${error.code || 'N/A'}`);
      }
      
      return false;
    }
  }

  /**
   * Test verschiedene DexScreener Endpunkte
   */
  async testBlockchainAPIs(): Promise<void> {
    console.log('🔍 === TESTE DEXSCREENER ENDPUNKTE ===');
    
    const testEndpoints = [
      { 
        name: 'Search SOL Pairs', 
        url: 'https://api.dexscreener.com/latest/dex/search?q=SOL',
        description: 'Suche nach SOL-Pairs'
      },
      { 
        name: 'SOL Token Pairs', 
        url: 'https://api.dexscreener.com/token-pairs/v1/solana/So11111111111111111111111111111111111111112',
        description: 'Wrapped SOL spezifische Pairs'
      },
      { 
        name: 'BONK Search', 
        url: 'https://api.dexscreener.com/latest/dex/search?q=BONK',
        description: 'Beliebter Memecoin-Test'
      }
    ];

    for (const endpoint of testEndpoints) {
      try {
        console.log(`\n🧪 Teste ${endpoint.name}...`);
        console.log(`   URL: ${endpoint.url}`);
        
        await this.handleRateLimit();
        
        const response = await axios.get(endpoint.url, {
          timeout: 8000
        });
        
        console.log(`✅ ${endpoint.name}: HTTP ${response.status}`);
        
        let dataCount = 0;
        if (Array.isArray(response.data)) {
          dataCount = response.data.length;
        } else if (response.data?.pairs) {
          dataCount = response.data.pairs.length;
        }
        
        console.log(`   Daten erhalten: ${dataCount} items`);
        
      } catch (error) {
        console.log(`❌ ${endpoint.name}: Fehlgeschlagen`);
        if (axios.isAxiosError(error)) {
          console.log(`   HTTP ${error.response?.status || 'N/A'}: ${error.message}`);
        }
      }
    }
  }

  /**
   * Test Working Queries für DexScreener
   */
  async testWorkingQueries(): Promise<void> {
    console.log('🧪 === TESTE DEXSCREENER WORKING QUERIES ===');
    
    try {
      // Test 1: Basis-Abfrage
      console.log('\n🔍 Test 1: Multi-Token Raydium Collection...');
      const tokens = await this.getEnhancedRaydiumTokens();
      console.log(`✅ ${tokens.length} Raydium-Token erfolgreich geladen`);
      
      if (tokens.length > 0) {
        console.log('\n📊 Top 3 Token:');
        tokens.slice(0, 3).forEach((token, i) => {
          console.log(`${i + 1}. ${token.tokenSymbol} (${token.tokenAddress.slice(0, 8)}...)`);
          console.log(`   Preis: $${token.priceUSD.toFixed(6)}`);
          console.log(`   Volume: $${token.volumeUSD24h.toLocaleString()}`);
          console.log(`   Änderung: ${token.priceChange24h.toFixed(2)}%`);
          console.log(`   Liquidität: $${token.liquidityUSD.toLocaleString()}`);
          console.log(`   Trades: ${token.trades24h.toLocaleString()}`);
        });
      }
      
    } catch (error) {
      console.log('❌ Working Queries Test fehlgeschlagen:', error);
    }
  }
}

export const bitqueryAPI = new BitqueryAPI();