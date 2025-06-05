const https = require('https');

const API_KEY = 'ory_at_4t1KnHlwObAx_MVV5xuXlHRa86VmpiA7KhJjNLyC9MQ.-3tIZhQyT8xbIf5EQnt2e8GLnux0pFAwyl1uCVzZQZg';

console.log('🔧 === KORREKTE BITQUERY V2 API TESTS ===');

// Test 1: EVM Feld erkunden
const evmExploreQuery = `
  query {
    EVM {
      __typename
    }
  }
`;

// Test 2: EVM Solana Network testen
const evmSolanaQuery = `
  query {
    EVM(network: solana) {
      Blocks(limit: 1) {
        Block {
          Number
        }
      }
    }
  }
`;

// Test 3: EVM DEXTrades testen
const evmDexTradesQuery = `
  query {
    EVM(network: solana) {
      DEXTrades(limit: 5) {
        Trade {
          Dex {
            ProgramAddress
            ProtocolName
          }
          Buy {
            Currency {
              Name
              Symbol
              SmartContract
            }
            Amount
          }
          Sell {
            Currency {
              Name
              Symbol  
              SmartContract
            }
            Amount
          }
        }
        Block {
          Time
        }
      }
    }
  }
`;

function makeRequest(query, description) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query });
    
    const options = {
      hostname: 'streaming.bitquery.io',
      port: 443,
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`\n🧪 Testing: ${description}`);
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        
        try {
          const response = JSON.parse(data);
          
          if (response.errors) {
            console.log('❌ GraphQL Errors:', JSON.stringify(response.errors, null, 2));
          } else if (response.data) {
            console.log('✅ Success! Data:', JSON.stringify(response.data, null, 2));
          }
          
          resolve(response);
        } catch (error) {
          console.log('❌ JSON Parse Error:', error.message);
          console.log('Raw Response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request Error:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function runCorrectTests() {
  try {
    // Test 1: EVM Feld erkunden
    console.log('\n=== TEST 1: EVM FELD ERKUNDEN ===');
    await makeRequest(evmExploreQuery, 'EVM Field Exploration');
    
    // Test 2: EVM Solana Network
    console.log('\n=== TEST 2: EVM SOLANA NETWORK ===');
    await makeRequest(evmSolanaQuery, 'EVM Solana Blocks');
    
    // Test 3: EVM DEX Trades
    console.log('\n=== TEST 3: EVM SOLANA DEX TRADES ===');
    await makeRequest(evmDexTradesQuery, 'EVM Solana DEX Trades');
    
  } catch (error) {
    console.error('❌ Test Fehler:', error.message);
  }
}

console.log('🚀 Starte korrekte Bitquery V2 API Tests...');
runCorrectTests(); 