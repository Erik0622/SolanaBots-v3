const https = require('https');
require('dotenv').config();

// Bitquery API Konfiguration
const BITQUERY_CONFIG = {
  url: 'https://streaming.bitquery.io/graphql',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.BITQUERY_API_KEY}`,
    'X-API-KEY': process.env.BITQUERY_API_KEY
  }
};

console.log('🔧 === BITQUERY API DIAGNOSE ===');
console.log('API Key verfügbar:', !!process.env.BITQUERY_API_KEY);
console.log('API Key Länge:', process.env.BITQUERY_API_KEY?.length || 0);

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
            ofType {
              name
              kind
            }
          }
          description
        }
      }
    }
  }
`;

// Einfacher Test Query
const simpleQuery = `
  query {
    __type(name: "Query") {
      fields {
        name
        description
      }
    }
  }
`;

// Alternativer Solana Test
const alternativeQuery = `
  query {
    solana: ethereum(network: bsc) {
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
        ...BITQUERY_CONFIG.headers,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`\n🧪 Testing: ${description}`);
    console.log('Request Headers:', options.headers);

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        try {
          const response = JSON.parse(data);
          console.log('Response:', JSON.stringify(response, null, 2));
          resolve(response);
        } catch (error) {
          console.log('Raw Response:', data);
          reject(new Error(`JSON Parse Error: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request Error:', error);
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
    }

    // Test 2: Simple Type Query
    console.log('\n=== TEST 2: SIMPLE TYPE QUERY ===');
    await makeRequest(simpleQuery, 'Simple Type Query');

    // Test 3: Alternative Query
    console.log('\n=== TEST 3: ALTERNATIVE QUERY ===');
    await makeRequest(alternativeQuery, 'Alternative Query Test');

  } catch (error) {
    console.error('❌ Test Fehler:', error.message);
  }
}

runTests(); 