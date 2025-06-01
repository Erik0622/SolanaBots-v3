import { CustomBot } from '@/hooks/useCustomBots';

// Vordefinierte Bots (diese werden immer angezeigt)
export const predefinedBots: CustomBot[] = [
  {
    id: 'volume-tracker',
    name: 'Volume Tracker',
    description: 'A powerful bot that detects sudden volume spikes in newly listed tokens (< 24h) and automatically trades when specific volume thresholds relative to market cap are reached.',
    weeklyReturn: '+25.0%',
    monthlyReturn: '+71.6%',
    trades: 118,
    winRate: '73%',
    strategy: 'Buys when specific volume-to-market-cap thresholds are met in freshly listed tokens (under 24h), avoiding the first 30 minutes after launch. Sells with tiered profit-taking at 70% and full exit at 140% profit, with a stop-loss at 35%.',
    riskLevel: 'moderate',
    riskColor: 'text-yellow-400',
    baseRiskPerTrade: 15,
    riskManagement: 'Stop loss at 35%, Take profit at 70% and 140%',
    status: 'active',
    profitToday: 125.45,
    profitWeek: 450.80,
    profitMonth: 1250.60,
    createdAt: '2024-01-01T00:00:00.000Z',
    walletAddress: 'system'
  },
  {
    id: 'momentum-bot',
    name: 'Momentum Bot',
    description: 'An advanced bot that identifies explosive price movements in new tokens by detecting consecutive green candles with increasing volume.',
    weeklyReturn: '+38.4%',
    monthlyReturn: '+109.4%',
    trades: 84,
    winRate: '65%',
    strategy: 'Identifies strong momentum signals, including at least 3 consecutive green candles and 15%+ price increase in 15 minutes with increasing volume.',
    riskLevel: 'high',
    riskColor: 'text-red-400',
    baseRiskPerTrade: 25,
    riskManagement: 'Dynamic stop loss based on volatility, Take profit at 60%, 100%, and 140%',
    status: 'active',
    profitToday: 245.30,
    profitWeek: 890.15,
    profitMonth: 2450.75,
    createdAt: '2024-01-01T00:00:00.000Z',
    walletAddress: 'system'
  },
  {
    id: 'dip-hunter',
    name: 'Dip Hunter',
    description: 'An intelligent bot that identifies significant price drops (30-60%) in new but stable tokens and capitalizes on high-potential entry opportunities.',
    weeklyReturn: '+23.4%',
    monthlyReturn: '+67.2%',
    trades: 326,
    winRate: '91%',
    strategy: 'Identifies optimal dip-buying opportunities during 30-60% price retracements from all-time highs, but only in tokens with stable liquidity and sustained trading volume.',
    riskLevel: 'low',
    riskColor: 'text-green-400',
    baseRiskPerTrade: 10,
    riskManagement: 'Fixed stop loss at 15%, Take profit at 50% and 100%',
    status: 'active',
    profitToday: 85.20,
    profitWeek: 320.45,
    profitMonth: 950.30,
    createdAt: '2024-01-01T00:00:00.000Z',
    walletAddress: 'system'
  }
];

export interface BotConfig {
  id: string;
  name: string;
  description: string;
  category: 'volume' | 'trend' | 'arbitrage';
  riskLevel: 'low' | 'medium' | 'high';
  minimumBalance: number;
  enabled: boolean;
}

export const defaultBots: BotConfig[] = [
  {
    id: 'volume-tracker',
    name: 'Volume Tracker',
    description: 'Tracks volume spikes and trades accordingly',
    category: 'volume',
    riskLevel: 'medium',
    minimumBalance: 0.1,
    enabled: true,
  },
  {
    id: 'trend-surfer',
    name: 'Trend Surfer',
    description: 'Follows market trends for optimal entry/exit points',
    category: 'trend',
    riskLevel: 'low',
    minimumBalance: 0.05,
    enabled: true,
  },
  {
    id: 'arbitrage-finder',
    name: 'Arbitrage Finder',
    description: 'Finds arbitrage opportunities between DEXs',
    category: 'arbitrage',
    riskLevel: 'high',
    minimumBalance: 0.2,
    enabled: false,
  },
];

export const getBotById = (id: string): BotConfig | undefined => {
  return defaultBots.find(bot => bot.id === id);
};

export const getEnabledBots = (): BotConfig[] => {
  return defaultBots.filter(bot => bot.enabled);
}; 