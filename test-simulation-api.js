const { BitqueryAPI } = require('./lib/apis/bitqueryAPI.ts');

console.log('🔧 === DEXSCREENER SIMULATION TEST ===');
console.log('🎉 Teste die neue DexScreener-basierte Trading-Simulation!');

// Import TypeScript files via ts-node
const { exec } = require('child_process');
const path = require('path');

async function testDexScreenerSimulation() {
  try {
    console.log('\n🚀 === STARTE DEXSCREENER API TEST ===\n');
    
    // Direct TypeScript execution
    const tsFile = path.join(__dirname, 'test-dexscreener-direct.ts');
    
    // Create TypeScript test file
    const fs = require('fs');
    const tsTestContent = `
import { BitqueryAPI } from './lib/apis/bitqueryAPI';

async function testDirectAPI() {
  console.log('🔧 === DIREKTE DEXSCREENER API TESTS ===');
  
  try {
    const api = new BitqueryAPI();
    
    // Test API Configuration
    console.log('\\n📋 Testing API Configuration...');
    await api.debugAPIConfig();
    
    // Test Connection
    console.log('\\n🔗 Testing Connection...');
    const connectionWorking = await api.testConnection();
    
    if (!connectionWorking) {
      throw new Error('DexScreener API Connection failed');
    }
    
    // Test Working Queries
    console.log('\\n🧪 Testing Working Queries...');
    await api.testWorkingQueries();
    
    // Test Main Function
    console.log('\\n🎯 Testing Main Function: getEnhancedRaydiumTokens...');
    const tokens = await api.getEnhancedRaydiumTokens();
    
    console.log(\`✅ SUCCESS: \${tokens.length} tokens loaded!\`);
    
    if (tokens.length > 0) {
      console.log('\\n📊 === TRADING DATA PREVIEW ===');
      tokens.slice(0, 5).forEach((token, index) => {
        console.log(\`\${index + 1}. \${token.tokenSymbol} (\${token.tokenAddress.slice(0, 8)}...)\`);
        console.log(\`   Preis: $\${token.priceUSD.toFixed(6)}\`);
        console.log(\`   Volume: $\${token.volumeUSD24h.toLocaleString()}\`);
        console.log(\`   Liquidität: $\${token.liquidityUSD.toLocaleString()}\`);
        console.log(\`   Änderung: \${token.priceChange24h.toFixed(2)}%\`);
        console.log(\`   Trades: \${token.trades24h.toLocaleString()}\`);
        console.log(\`   Timestamp: \${token.timestamp}\`);
      });
      
      console.log('\\n🎉 === DEXSCREENER INTEGRATION ERFOLGREICH ===');
      console.log('✅ DexScreener API funktioniert perfekt!');
      console.log('✅ Echte Raydium Trading-Daten verfügbar!');
      console.log('✅ Keine API-Keys benötigt!'); 
      console.log('✅ Trading-Bot kann live Daten verwenden!');
      
      return tokens;
    } else {
      throw new Error('Keine Token geladen - API Problem');
    }
    
  } catch (error) {
    console.error('❌ === TEST FEHLGESCHLAGEN ===');
    console.error('Error:', error instanceof Error ? error.message : 'Unbekannt');
    throw error;
  }
}

testDirectAPI().catch(console.error);
`;
    
    fs.writeFileSync(tsFile, tsTestContent);
    
    console.log('📝 TypeScript-Test-Datei erstellt');
    console.log('🔄 Führe Test aus...\n');
    
    // Execute with ts-node
    exec(`npx ts-node ${tsFile}`, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Ausführungsfehler:', error);
        
        // Fallback: Direct import test
        console.log('\n🔄 === FALLBACK: DIRECT NODE.JS TEST ===\n');
        testDirectlyWithRequire();
        return;
      }
      
      if (stderr) {
        console.error('⚠️ Warnings:', stderr);
      }
      
      console.log(stdout);
      
      // Cleanup
      if (fs.existsSync(tsFile)) {
        fs.unlinkSync(tsFile);
      }
    });
    
  } catch (error) {
    console.error('❌ Setup Fehler:', error);
    
    // Fallback
    console.log('\n🔄 === FALLBACK: DIRECT NODE.JS TEST ===\n');
    testDirectlyWithRequire();
  }
}

async function testDirectlyWithRequire() {
  console.log('🔧 === DIRECT NODE.JS API TEST ===');
  
  try {
    // Test DexScreener API direkt mit node-fetch
    const https = require('https');
    
    console.log('🧪 Testing DexScreener Search API...');
    
    const testResponse = await new Promise((resolve, reject) => {
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
          try {
            const response = JSON.parse(data);
            resolve(response);
          } catch (parseError) {
            reject(parseError);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
    
    console.log(\`📊 API Response Status: SUCCESS\`);
    console.log(\`📈 Total Pairs: \${testResponse.pairs?.length || 0}\`);
    
    if (testResponse.pairs) {
      // Filter Raydium pairs
      const raydiumPairs = testResponse.pairs.filter(pair => 
        pair.chainId === 'solana' && pair.dexId === 'raydium'
      );
      
      console.log(\`🎯 Raydium Pairs: \${raydiumPairs.length}\`);
      
      if (raydiumPairs.length > 0) {
        console.log('\\n📊 === RAYDIUM TRADING PAIRS ===');
        raydiumPairs.slice(0, 3).forEach((pair, index) => {
          console.log(\`\${index + 1}. \${pair.baseToken?.symbol}/\${pair.quoteToken?.symbol}\`);
          console.log(\`   Address: \${pair.baseToken?.address?.slice(0, 8)}...\`);
          console.log(\`   Preis: $\${pair.priceUsd}\`);
          console.log(\`   Volume: $\${pair.volume?.h24 || 'N/A'}\`);
          console.log(\`   Liquidität: $\${pair.liquidity?.usd || 'N/A'}\`);
        });
        
        console.log('\\n🎉 === DEXSCREENER DIRECT ACCESS ERFOLGREICH ===');
        console.log('✅ DexScreener API ist erreichbar!');
        console.log('✅ Solana/Raydium-Daten verfügbar!');
        console.log('✅ Bereit für Trading Bot Integration!');
      }
    }
    
  } catch (error) {
    console.error('❌ Direct Test fehlgeschlagen:', error);
  }
}

// Start the test
testDexScreenerSimulation(); 