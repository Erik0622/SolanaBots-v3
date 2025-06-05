const https = require('https');

// WICHTIG: Fügen Sie hier Ihren echten Bitquery API Key ein
const API_KEY = 'ory_at_4t1KnHlwObAx_MVV5xuXlHRa86VmpiA7KhJjNLyC9MQ.-3tIZhQyT8xbIf5EQnt2e8GLnux0pFAwyl1uCVzZQZg';

console.log('🔧 === BITQUERY API DIAGNOSE ===');
console.log('API Key verfügbar:', !!API_KEY && API_KEY !== 'YOUR_BITQUERY_API_KEY_HERE');

if (!API_KEY || API_KEY === 'YOUR_BITQUERY_API_KEY_HERE') {
  console.log('❌ FEHLER: Bitte fügen Sie Ihren echten Bitquery API Key in die test-bitquery-simple.js Datei ein!');
  process.exit(1);
}

// Schema Introspection Query
const introspectionQuery = `
  query IntrospectionQuery {
    __schema {
      queryType {
        fields {
          name
          type {
            name
            kind
          }
          description
        }
      }
    }
  }
`;

// Test Query für bekannte Felder
const testQuery1 = `
  query {
    __type(name: "Query") {
      fields {
        name
        description
      }
    }
  }
`;

// Ethereum Test (sollte funktionieren)
const testQuery2 = `
  query {
    ethereum(network: ethereum) {
      blocks(limit: 1) {
        count
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
        'X-API-KEY': API_KEY,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`\n🧪 Testing: ${description}`);
    console.log('URL: https://streaming.bitquery.io/graphql');
    console.log('Authorization Header:', `Bearer ${API_KEY.substring(0, 10)}...`);

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log('Response Headers:', res.headers);
        
        try {
          const response = JSON.parse(data);
          
          if (response.errors) {
            console.log('❌ GraphQL Errors:', JSON.stringify(response.errors, null, 2));
          }
          
          if (response.data) {
            console.log('✅ Data received:', JSON.stringify(response.data, null, 2));
          }
          
          resolve(response);
        } catch (error) {
          console.log('❌ JSON Parse Error:', error.message);
          console.log('Raw Response:', data);
          reject(new Error(`JSON Parse Error: ${error.message}`));
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

async function runTests() {
  try {
    // Test 1: Schema Introspection
    console.log('\n=== TEST 1: SCHEMA INTROSPECTION ===');
    const schemaResult = await makeRequest(introspectionQuery, 'Schema Introspection');
    
    if (schemaResult?.data?.__schema?.queryType?.fields) {
      const fields = schemaResult.data.__schema.queryType.fields;
      console.log('\n📊 Verfügbare Root Query Fields:');
      fields.forEach(field => {
        console.log(`- ${field.name}: ${field.type?.name || field.type?.kind}`);
        if (field.name.toLowerCase().includes('solana')) {
          console.log(`  🎯 SOLANA FELD GEFUNDEN: ${field.name}`);
        }
      });
      
      // Alle Felder die mit 's' anfangen anzeigen
      const sFields = fields.filter(f => f.name.toLowerCase().startsWith('s'));
      if (sFields.length > 0) {
        console.log('\n📋 Felder die mit "S" beginnen:');
        sFields.forEach(field => {
          console.log(`- ${field.name}`);
        });
      }
    }

    // Test 2: Simple Type Query
    console.log('\n=== TEST 2: TYPE QUERY ===');
    await makeRequest(testQuery1, 'Type Query');

    // Test 3: Ethereum Test (bekanntermaßen funktionierend)
    console.log('\n=== TEST 3: ETHEREUM TEST ===');
    await makeRequest(testQuery2, 'Ethereum Test');

  } catch (error) {
    console.error('❌ Test Fehler:', error.message);
  }
}

console.log('\n🚀 Starte Bitquery API Tests...');
runTests(); 