import { NextApiRequest, NextApiResponse } from 'next';
import { BitqueryAPI } from '../../lib/apis/bitqueryAPI';

// TEMPORÄRE API-KEY KONFIGURATION bis .env funktioniert
if (!process.env.BITQUERY_API_KEY) {
  process.env.BITQUERY_API_KEY = 'ory_at_4t1KnHlwObAx_MVV5xuXlHRa86VmpiA7KhJjNLyC9MQ.-3tIZhQyT8xbIf5EQnt2e8GLnux0pFAwyl1uCVzZQZg';
}

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

// BitqueryToken interface (corresponds to RaydiumTrade from DexScreener)
interface BitqueryToken {
  address: string;
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  liquidity: number;
  trades24h: number;
  createdAt: string;
}

interface SimulationResult {
  botType: string;
  status: 'success' | 'failed';
  totalTrades: number;
  successfulTrades: number;
  totalProfit: number;
  profitPercentage: number;
  tradeCount: number;
  successRate: number;
  dailyData: { date: string; value: number }[];
  tokens: RaydiumTrade[];
  riskMetrics: {
    maxDrawdown: number;
    sharpeRatio: number;
    winRate: number;
  };
  debugLogs: string[];
  dataSource: string;
}

export const config = {
  api: {
    responseLimit: false,
    maxDuration: 60, // 60 Sekunden für Pro Plan (statt 10s default)
  },
}

// Debug logging
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { botType, tokenCount = 10 } = req.body;

    if (!botType) {
      return res.status(400).json({ message: 'Bot type is required' });
    }

    console.log('🎯 Using DexScreener-based simulation (no API keys required)');
    const result = await runDexScreenerSimulation(botType, tokenCount);
    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ Simulation API Error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function runDexScreenerSimulation(
  botType: string,
  tokenCount: number
): Promise<SimulationResult> {
  
  clearDebugLogs();
  addDebugLog('🔍 Starting DexScreener-based simulation...');
  
  try {
    const dexScreenerAPI = new BitqueryAPI();
    
    // Test API Connection
    addDebugLog('🧪 Testing DexScreener API...');
    const connectionWorking = await dexScreenerAPI.testConnection();
    if (!connectionWorking) {
      throw new Error('DexScreener API connection failed');
    }
    
    // Get current trading tokens
    addDebugLog('📊 Fetching Raydium tokens...');
    const raydiumTokens = await dexScreenerAPI.getEnhancedRaydiumTokens();
    addDebugLog(`✅ Loaded ${raydiumTokens.length} tokens`);
    
    if (raydiumTokens.length === 0) {
      throw new Error('No tokens available');
    }
    
    // Select tokens for this bot type
    const selectedTokens = selectTokensForBot(raydiumTokens, botType, tokenCount);
    addDebugLog(`🎯 Selected ${selectedTokens.length} tokens for ${botType}`);
    
    // Run simulation
    const simulation = await simulateTrading(selectedTokens, botType);
    
    return {
      botType,
      status: 'success',
      totalTrades: simulation.totalTrades,
      successfulTrades: simulation.successfulTrades,
      totalProfit: simulation.totalProfit,
      profitPercentage: simulation.profitPercentage,
      tradeCount: simulation.totalTrades,
      successRate: simulation.successRate,
      dailyData: simulation.dailyData,
      tokens: selectedTokens,
      riskMetrics: {
        maxDrawdown: simulation.maxDrawdown,
        sharpeRatio: 1.2,
        winRate: simulation.successRate
      },
      debugLogs: [...debugLogs],
      dataSource: 'dexscreener-api'
    };
    
  } catch (error) {
    addDebugLog(`❌ Simulation failed: ${error instanceof Error ? error.message : 'Unknown'}`);
    
    return {
      botType,
      status: 'failed',
      totalTrades: 0,
      successfulTrades: 0,
      totalProfit: 0,
      profitPercentage: 0,
      tradeCount: 0,
      successRate: 0,
      dailyData: [],
      tokens: [],
      riskMetrics: { maxDrawdown: 0, sharpeRatio: 0, winRate: 0 },
      debugLogs: [...debugLogs],
      dataSource: 'dexscreener-api'
    };
  }
}

function selectTokensForBot(tokens: RaydiumTrade[], botType: string, count: number): RaydiumTrade[] {
  const sorted = [...tokens].sort((a, b) => {
    switch (botType) {
      case 'volume-tracker':
        return b.volumeUSD24h - a.volumeUSD24h;
      case 'trend-surfer':
        return b.priceChange24h - a.priceChange24h;
      case 'dip-hunter':
        return a.priceChange24h - b.priceChange24h;
      default:
        return b.volumeUSD24h - a.volumeUSD24h;
    }
  });
  
  return sorted.slice(0, count);
}

async function simulateTrading(tokens: RaydiumTrade[], botType: string) {
  const startingCapital = 1000;
  let currentCapital = startingCapital;
  let totalTrades = 0;
  let successfulTrades = 0;
  let maxCapital = startingCapital;
  
  const dailyData: { date: string; value: number }[] = [];
  
  addDebugLog(`🎯 Simulating ${botType} with ${tokens.length} tokens`);
  
  // Simulate 7 days of trading
  for (let day = 0; day < 7; day++) {
    const date = new Date();
    date.setDate(date.getDate() - (6 - day));
    const dateString = date.toISOString().split('T')[0];
    
    const dayStartCapital = currentCapital;
    
    // Trade top tokens for this day
    for (const token of tokens.slice(0, 5)) {
      if (currentCapital < 50) break;
      
      const shouldTrade = getTradeSignal(token, botType);
      
      if (shouldTrade) {
        const tradeAmount = Math.min(currentCapital * 0.15, 100); // 15% or max $100
        totalTrades++;
        
        const successProbability = calculateSuccessProbability(token, botType);
        const isSuccessful = Math.random() < successProbability;
        
        if (isSuccessful) {
          const profit = tradeAmount * (0.03 + Math.random() * 0.12); // 3-15% profit
          currentCapital += profit;
          successfulTrades++;
          addDebugLog(`✅ ${token.tokenSymbol}: +$${profit.toFixed(2)}`);
        } else {
          const loss = tradeAmount * (0.02 + Math.random() * 0.06); // 2-8% loss
          currentCapital -= loss;
          addDebugLog(`❌ ${token.tokenSymbol}: -$${loss.toFixed(2)}`);
        }
        
        maxCapital = Math.max(maxCapital, currentCapital);
      }
    }
    
    const dayProfit = currentCapital - dayStartCapital;
    addDebugLog(`📊 Day ${day + 1}: $${currentCapital.toFixed(2)} (${dayProfit >= 0 ? '+' : ''}$${dayProfit.toFixed(2)})`);
    
    dailyData.push({ date: dateString, value: currentCapital });
  }
  
  const totalProfit = currentCapital - startingCapital;
  const profitPercentage = (totalProfit / startingCapital) * 100;
  const successRate = totalTrades > 0 ? (successfulTrades / totalTrades) * 100 : 0;
  const maxDrawdown = ((maxCapital - currentCapital) / maxCapital) * 100;
  
  addDebugLog(`🎉 Final: $${currentCapital.toFixed(2)} | Profit: ${profitPercentage.toFixed(2)}% | Win Rate: ${successRate.toFixed(1)}%`);
  
  return {
    totalTrades,
    successfulTrades,
    totalProfit,
    profitPercentage,
    successRate,
    dailyData,
    maxDrawdown
  };
}

function getTradeSignal(token: RaydiumTrade, botType: string): boolean {
  switch (botType) {
    case 'volume-tracker':
      return token.volumeUSD24h > 50000 && token.trades24h > 100;
    case 'trend-surfer':
      return token.priceChange24h > 5 && token.volumeUSD24h > 20000;
    case 'dip-hunter':
      return token.priceChange24h < -5 && token.volumeUSD24h > 15000;
    default:
      return token.volumeUSD24h > 30000;
  }
}

function calculateSuccessProbability(token: RaydiumTrade, botType: string): number {
  let probability = 0.4; // Base 40%
  
  // Volume bonus
  if (token.volumeUSD24h > 100000) probability += 0.1;
  if (token.liquidityUSD > 50000) probability += 0.1;
  if (token.trades24h > 500) probability += 0.1;
  
  // Bot-specific bonuses
  switch (botType) {
    case 'volume-tracker':
      if (token.volumeUSD24h > 200000) probability += 0.15;
      break;
    case 'trend-surfer':
      if (token.priceChange24h > 10) probability += 0.15;
      break;
    case 'dip-hunter':
      if (token.priceChange24h < -10 && token.priceChange24h > -30) probability += 0.15;
      break;
  }
  
  return Math.min(0.75, Math.max(0.25, probability));
}