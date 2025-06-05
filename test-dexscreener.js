const https = require('https');

console.log('🔧 === DEXSCREENER API TEST ===');
console.log('🎉 KEINE API-KEYS ERFORDERLICH!');
console.log('Rate Limit: 300 requests/minute');
console.log('Dokumentation: https://docs.dexscreener.com/');

// Test 1: Search für SOL/Raydium Pairs
function testSearchSolPairs() {
  return new Promise((resolve, reject) => {
    console.log('\n🧪 === TEST 1: SEARCH SOL PAIRS ===');
    console.log('URL: https://api.dexscreener.com/latest/dex/search?q=SOL');

    const options = {
      hostname: 'api.dexscreener.com',
      port: 443,
      path: '/latest/dex/search?q=SOL',
      method: 'GET',
      headers: {
        'User-Agent': 'Solana-Trading-Bot/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 HTTP Status: ${res.statusCode}`);
        
        try {
          const response = JSON.parse(data);
          
          if (response.pairs) {
            console.log(`✅ Gesamt Pairs: ${response.pairs.length}`);
            
            // Filter für Raydium
            const raydiumPairs = response.pairs.filter(pair => pair.dexId === 'raydium');
            console.log(`🎯 Raydium Pairs: ${raydiumPairs.length}`);
            
            // Zeige Top 5 Raydium-Pairs
            console.log('\n📈 Top 5 Raydium SOL Pairs:');
            raydiumPairs.slice(0, 5).forEach((pair, index) => {
              console.log(`${index + 1}. ${pair.baseToken?.symbol || 'N/A'}/${pair.quoteToken?.symbol || 'N/A'}`);
              console.log(`   Address: ${pair.baseToken?.address?.slice(0, 8)}...`);
              console.log(`   Preis: $${pair.priceUsd || 'N/A'}`);
              console.log(`   Volume 24h: $${pair.volume?.h24 || 'N/A'}`);
              console.log(`   Liquidität: $${pair.liquidity?.usd || 'N/A'}`);
              console.log(`   Änderung 24h: ${pair.priceChange?.h24 || 'N/A'}%`);
            });
            
            resolve({ success: true, pairs: raydiumPairs.length });
          } else {
            console.log('❌ Keine pairs im Response');
            reject(new Error('Keine pairs gefunden'));
          }
          
        } catch (error) {
          console.log('❌ JSON Parse Error:', error.message);
          console.log('Raw Response:', data.substring(0, 200) + '...');
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request Error:', error);
      reject(error);
    });

    req.end();
  });
}

// Test 2: Spezifische Token-Pairs für Wrapped SOL
function testSpecificTokenPairs() {
  return new Promise((resolve, reject) => {
    console.log('\n🧪 === TEST 2: SPECIFIC TOKEN PAIRS ===');
    const solAddress = 'So11111111111111111111111111111111111111112'; // Wrapped SOL
    console.log(`Token: ${solAddress}`);
    console.log(`URL: https://api.dexscreener.com/token-pairs/v1/solana/${solAddress}`);

    const options = {
      hostname: 'api.dexscreener.com',
      port: 443,
      path: `/token-pairs/v1/solana/${solAddress}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Solana-Trading-Bot/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 HTTP Status: ${res.statusCode}`);
        
        try {
          const response = JSON.parse(data);
          
          if (Array.isArray(response) && response.length > 0) {
            console.log(`✅ Token Pairs gefunden: ${response.length}`);
            
            // Filter für Raydium
            const raydiumPairs = response.filter(pair => pair.dexId === 'raydium');
            console.log(`🎯 Raydium SOL Pairs: ${raydiumPairs.length}`);
            
            // Zeige Details der Top Pairs
            raydiumPairs.slice(0, 3).forEach((pair, index) => {
              console.log(`${index + 1}. Pair: ${pair.baseToken?.symbol}/${pair.quoteToken?.symbol}`);
              console.log(`   DEX: ${pair.dexId}`);
              console.log(`   Preis: $${pair.priceUsd}`);
              console.log(`   Volume: $${pair.volume?.h24 || 'N/A'}`);
              console.log(`   Liquidität: $${pair.liquidity?.usd || 'N/A'}`);
            });
            
            resolve({ success: true, pairs: raydiumPairs.length });
          } else {
            console.log('❌ Keine pairs für diesen Token');
            reject(new Error('Keine pairs für Token'));
          }
          
        } catch (error) {
          console.log('❌ JSON Parse Error:', error.message);
          console.log('Raw Response:', data.substring(0, 200) + '...');
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request Error:', error);
      reject(error);
    });

    req.end();
  });
}

// Test 3: Suche nach verschiedenen Memecoins
function testMemecoinSearch() {
  return new Promise((resolve, reject) => {
    console.log('\n🧪 === TEST 3: MEMECOIN SEARCH ===');
    console.log('Suche nach: BONK (beliebter Solana Memecoin)');
    console.log('URL: https://api.dexscreener.com/latest/dex/search?q=BONK');

    const options = {
      hostname: 'api.dexscreener.com',
      port: 443,
      path: '/latest/dex/search?q=BONK',
      method: 'GET',
      headers: {
        'User-Agent': 'Solana-Trading-Bot/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.pairs) {
            // Filter für Solana + Raydium Pairs
            const solanaPairs = response.pairs.filter(pair => 
              pair.chainId === 'solana' && pair.dexId === 'raydium'
            );
            
            console.log(`✅ BONK Solana/Raydium-Pairs: ${solanaPairs.length}`);
            
            if (solanaPairs.length > 0) {
              console.log('\n🚀 BONK Trading-Pairs auf Raydium:');
              solanaPairs.slice(0, 5).forEach((pair, index) => {
                const volume24h = parseFloat(pair.volume?.h24 || '0');
                const liquidity = parseFloat(pair.liquidity?.usd || '0');
                const price = parseFloat(pair.priceUsd || '0');
                const priceChange = parseFloat(pair.priceChange?.h24 || '0');
                
                console.log(`${index + 1}. ${pair.baseToken.symbol}/${pair.quoteToken.symbol}`);
                console.log(`   Token Address: ${pair.baseToken.address.slice(0, 8)}...`);
                console.log(`   Preis: $${price.toFixed(8)}`);
                console.log(`   Volume: $${volume24h.toLocaleString()}`);
                console.log(`   Liquidität: $${liquidity.toLocaleString()}`);
                console.log(`   Änderung: ${priceChange.toFixed(2)}%`);
                
                const buys = parseInt(pair.txns?.h24?.buys || '0');
                const sells = parseInt(pair.txns?.h24?.sells || '0');
                console.log(`   Trades: ${(buys + sells).toLocaleString()} (Buy: ${buys}, Sell: ${sells})`);
              });
            }
            
            resolve({ success: true, pairs: solanaPairs.length });
          } else {
            reject(new Error('Keine pairs im Response'));
          }
          
        } catch (error) {
          console.log('❌ Error:', error.message);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request Error:', error);
      reject(error);
    });

    req.end();
  });
}

// Test 4: Live Trading Data Format Test
function testTradingDataFormat() {
  return new Promise((resolve, reject) => {
    console.log('\n🧪 === TEST 4: TRADING DATA FORMAT ===');
    console.log('Test für Trading-Bot-kompatible Datenstruktur');
    console.log('URL: https://api.dexscreener.com/latest/dex/search?q=USDC');

    const options = {
      hostname: 'api.dexscreener.com',
      port: 443,
      path: '/latest/dex/search?q=USDC',
      method: 'GET',
      headers: {
        'User-Agent': 'Solana-Trading-Bot/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.pairs) {
            // Filter für Solana Raydium mit hohem Volume
            const qualityPairs = response.pairs.filter(pair => {
              const isSolana = pair.chainId === 'solana';
              const isRaydium = pair.dexId === 'raydium';
              const hasPrice = pair.priceUsd && parseFloat(pair.priceUsd) > 0;
              const hasVolume = pair.volume?.h24 && parseFloat(pair.volume.h24) > 50000; // > $50k Volume
              const hasLiquidity = pair.liquidity?.usd && parseFloat(pair.liquidity.usd) > 10000; // > $10k Liquidität
              const hasTokens = pair.baseToken && pair.quoteToken;
              
              return isSolana && isRaydium && hasPrice && hasVolume && hasLiquidity && hasTokens;
            });
            
            console.log(`✅ High-Quality Trading Pairs: ${qualityPairs.length}`);
            
            // Konvertiere zu Trading-Bot-Format
            const tradingData = qualityPairs.slice(0, 10).map(pair => ({
              tokenAddress: pair.baseToken.address,
              tokenName: pair.baseToken.name || 'Unknown Token',
              tokenSymbol: pair.baseToken.symbol || 'UNKNOWN',
              priceUSD: parseFloat(pair.priceUsd || '0'),
              volumeUSD24h: parseFloat(pair.volume?.h24 || '0'),
              priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
              liquidityUSD: parseFloat(pair.liquidity?.usd || '0'),
              trades24h: parseInt(pair.txns?.h24?.buys || '0') + parseInt(pair.txns?.h24?.sells || '0'),
              timestamp: new Date().toISOString(),
              // Zusätzliche Trading-relevante Daten
              pairAddress: pair.pairAddress,
              dexId: pair.dexId,
              chainId: pair.chainId,
              marketCap: pair.marketCap || null,
              fdv: pair.fdv || null
            }));
            
            console.log('\n🎯 Trading-Bot-Format (Top 3):');
            tradingData.slice(0, 3).forEach((token, index) => {
              console.log(`${index + 1}. ${token.tokenSymbol}:`);
              console.log(`   Address: ${token.tokenAddress.slice(0, 8)}...`);
              console.log(`   Preis: $${token.priceUSD.toFixed(6)}`);
              console.log(`   Volume: $${token.volumeUSD24h.toLocaleString()}`);
              console.log(`   Liquidität: $${token.liquidityUSD.toLocaleString()}`);
              console.log(`   Change: ${token.priceChange24h.toFixed(2)}%`);
              console.log(`   Trades: ${token.trades24h.toLocaleString()}`);
            });
            
            resolve({ success: true, tradingTokens: tradingData.length });
          } else {
            reject(new Error('Keine pairs im Response'));
          }
          
        } catch (error) {
          console.log('❌ Error:', error.message);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request Error:', error);
      reject(error);
    });

    req.end();
  });
}

// Führe alle Tests aus
async function runAllTests() {
  try {
    console.log('🚀 Starte DexScreener API Tests...\n');
    
    // Test 1
    const test1 = await testSearchSolPairs();
    console.log(`✅ Test 1 abgeschlossen: ${test1.pairs} SOL/Raydium-Pairs gefunden`);
    
    // Kleine Pause zwischen Requests
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 2
    const test2 = await testSpecificTokenPairs();
    console.log(`✅ Test 2 abgeschlossen: ${test2.pairs} Wrapped SOL Pairs gefunden`);
    
    // Kleine Pause zwischen Requests
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 3
    const test3 = await testMemecoinSearch();
    console.log(`✅ Test 3 abgeschlossen: ${test3.pairs} BONK-Pairs gefunden`);
    
    // Kleine Pause zwischen Requests
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 4
    const test4 = await testTradingDataFormat();
    console.log(`✅ Test 4 abgeschlossen: ${test4.tradingTokens} Trading-Tokens konvertiert`);
    
    console.log('\n🎉 === ALLE TESTS ERFOLGREICH ===');
    console.log('✅ DexScreener API funktioniert perfekt!');
    console.log('✅ Keine API-Keys benötigt!');
    console.log('✅ Raydium-Daten verfügbar!');
    console.log('✅ Trading-Bot-Format kompatibel!');
    console.log('✅ Bereit für Trading Bot Integration!');
    
  } catch (error) {
    console.error('\n❌ === TEST FEHLGESCHLAGEN ===');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Starte Tests
runAllTests(); 