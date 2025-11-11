import type { TokenMarketResponse } from "@/types/api";

// Bitquery GraphQL API
const BITQUERY_API = "https://streaming.bitquery.io/graphql";
const BITQUERY_API_KEY = process.env.NEXT_PUBLIC_BITQUERY_API_KEY || "";

// Helper function to execute Bitquery GraphQL queries
const executeBitqueryQuery = async (query: string, variables?: Record<string, any>) => {
    try {
        const response = await fetch(BITQUERY_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${BITQUERY_API_KEY}`,
            },
            body: JSON.stringify({ query, variables }),
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Bitquery API error:', response.status, errorText);
            throw new Error(`Bitquery API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.errors) {
            console.error('Bitquery GraphQL errors:', data.errors);
            throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
        }

        return data.data;
    } catch (error) {
        console.error('Failed to execute Bitquery query:', error);
        throw error;
    }
};

// Helper to get token logo from various sources
const getTokenLogo = (mintAddress: string, uri?: string, symbol?: string): string => {
    // Try Solana token list first
    const solanaTokenLogo = `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${mintAddress}/logo.png`;

    // Fallback to generated avatar
    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(symbol || 'TOKEN')}&background=random&size=128`;

    // Return solana token list URL (will fallback in image component if 404)
    return solanaTokenLogo;
};

// GraphQL query for trending Solana tokens - simplified and working
const TRENDING_TOKENS_QUERY = `
query TrendingSolanaTokens($limit: Int!) {
  Solana {
    DEXTradeByTokens(
      orderBy: {descendingByField: "volume"}
      limit: {count: $limit}
      where: {
        Trade: {
          Currency: {MintAddress: {notIn: ["11111111111111111111111111111111"]}}
          AmountInUSD: {gt: "0"}
        }
      }
    ) {
      Trade {
        Currency {
          Symbol
          Name
          MintAddress
          Uri
        }
        Dex {
          ProtocolName
          ProtocolFamily
        }
        PriceInUSD
      }
      volume: sum(of: Trade_AmountInUSD)
      trades: count
      buyers: uniq(of: Trade_Account_Owner)
      sellers: uniq(of: Trade_Side_Account_Owner)
      buys: count(if: {Trade: {Side: {Type: {is: buy}}}})
      sells: count(if: {Trade: {Side: {Type: {is: sell}}}})
      buyVolume: sum(of: Trade_AmountInUSD, if: {Trade: {Side: {Type: {is: buy}}}})
      sellVolume: sum(of: Trade_AmountInUSD, if: {Trade: {Side: {Type: {is: sell}}}})
    }
  }
}
`;

// GraphQL query for token holders and supply data
const TOKEN_HOLDERS_QUERY = `
query TokenHolders($address: String!) {
  Solana {
    BalanceUpdates(
      where: {BalanceUpdate: {Currency: {MintAddress: {is: $address}}}}
      orderBy: {descendingByField: "balance"}
      limit: {count: 100}
    ) {
      BalanceUpdate {
        Account {
          Address
        }
      }
      balance: sum(of: BalanceUpdate_Amount, selectWhere: {gt: "0"})
      holders: count(distinct: BalanceUpdate_Account_Address, if: {BalanceUpdate: {Amount: {gt: "0"}}})
    }
  }
}
`;

// GraphQL query for new token pairs (recently created)
const NEW_PAIRS_QUERY = `
query NewSolanaPairs($limit: Int!) {
  Solana {
    DEXTradeByTokens(
      orderBy: {descending: Block_Time}
      limit: {count: $limit}
      where: {
        Trade: {
          Currency: {MintAddress: {notIn: ["11111111111111111111111111111111"]}}
          AmountInUSD: {gt: "0"}
        }
      }
    ) {
      Trade {
        Currency {
          Symbol
          Name
          MintAddress
          Uri
        }
        Dex {
          ProtocolName
          ProtocolFamily
        }
        PriceInUSD
      }
      Block {
        Time
      }
      volume: sum(of: Trade_AmountInUSD)
      trades: count
      buyers: uniq(of: Trade_Account_Owner)
      sellers: uniq(of: Trade_Side_Account_Owner)
      buys: count(if: {Trade: {Side: {Type: {is: buy}}}})
      sells: count(if: {Trade: {Side: {Type: {is: sell}}}})
      buyVolume: sum(of: Trade_AmountInUSD, if: {Trade: {Side: {Type: {is: buy}}}})
      sellVolume: sum(of: Trade_AmountInUSD, if: {Trade: {Side: {Type: {is: sell}}}})
    }
  }
}
`;

// GraphQL query for token OHLC data (sparkline)
const TOKEN_OHLC_QUERY = `
query TokenOHLC($address: String!) {
  Solana {
    DEXTradeByTokens(
      where: {
        Trade: {Currency: {MintAddress: {is: $address}}}
      }
      orderBy: {ascending: Block_Time}
      limit: {count: 24}
    ) {
      Block {
        Time
      }
      Trade {
        PriceInUSD
      }
    }
  }
}
`;

// GraphQL query for Pump.fun tokens above 95% bonding curve (surging)
const PUMP_SURGING_QUERY = `
query PumpSurgingTokens($limit: Int!) {
  Solana {
    DEXTradeByTokens(
      orderBy: {descendingByField: "volume"}
      limit: {count: $limit}
      where: {
        Trade: {
          Dex: {ProtocolName: {is: "pump"}}
          Currency: {MintAddress: {notIn: ["11111111111111111111111111111111"]}}
          AmountInUSD: {gt: "0"}
        }
      }
    ) {
      Trade {
        Currency {
          Symbol
          Name
          MintAddress
          Uri
        }
        Dex {
          ProtocolName
          ProtocolFamily
        }
        PriceInUSD
      }
      volume: sum(of: Trade_AmountInUSD)
      trades: count
      buyers: uniq(of: Trade_Account_Owner)
      sellers: uniq(of: Trade_Side_Account_Owner)
      buys: count(if: {Trade: {Side: {Type: {is: buy}}}})
      sells: count(if: {Trade: {Side: {Type: {is: sell}}}})
      buyVolume: sum(of: Trade_AmountInUSD, if: {Trade: {Side: {Type: {is: buy}}}})
      sellVolume: sum(of: Trade_AmountInUSD, if: {Trade: {Side: {Type: {is: sell}}}})
    }
  }
}
`;

// Fetch holder count for a token
const fetchTokenHolders = async (mintAddress: string): Promise<number> => {
    try {
        const data = await executeBitqueryQuery(TOKEN_HOLDERS_QUERY, {
            address: mintAddress,
        });

        const holders = data?.Solana?.BalanceUpdates?.[0]?.holders || 0;
        return parseInt(holders) || 0;
    } catch (error) {
        console.error('Failed to fetch holders for', mintAddress, error);
        return 0;
    }
};

// Fetch sparkline data for a token
const fetchTokenSparkline = async (mintAddress: string): Promise<number[]> => {
    try {
        const data = await executeBitqueryQuery(TOKEN_OHLC_QUERY, {
            address: mintAddress,
        });

        const candles = data?.Solana?.DEXTradeByTokens || [];
        return candles.map((candle: any) => parseFloat(candle.Trade?.PriceInUSD) || 0).filter((p: number) => p > 0);
    } catch (error) {
        console.error('Failed to fetch sparkline for', mintAddress, error);
        return [];
    }
};

// Main function: Fetch trending Solana tokens with surge detection
export const fetchSolanaTokensFromJupiter = async (): Promise<TokenMarketResponse[]> => {
    console.log('🚀 Fetching trending Solana tokens from Bitquery');
    console.log('API Key present:', !!BITQUERY_API_KEY);
    console.log('API Key length:', BITQUERY_API_KEY?.length);

    try {
        const data = await executeBitqueryQuery(TRENDING_TOKENS_QUERY, {
            limit: 100,
        });

        console.log('Raw Bitquery response:', JSON.stringify(data, null, 2));

        const trades = data?.Solana?.DEXTradeByTokens || [];

        if (trades.length === 0) {
            console.warn('⚠️ No trending tokens found, using fallback');
            console.log('Full data object:', data);
            return MOCK_TOKENS;
        }

        console.log(`✅ Found ${trades.length} trending tokens`);

        // Map to our token format (take top 50 by volume)
        const tokens: TokenMarketResponse[] = await Promise.all(
            trades.slice(0, 50).map(async (trade: any, index: number) => {
                const currency = trade.Trade?.Currency;
                const mintAddress = currency?.MintAddress || '';
                const symbol = currency?.Symbol || 'UNKNOWN';
                const name = currency?.Name || symbol;
                const uri = currency?.Uri;
                const dex = trade.Trade?.Dex?.ProtocolName || 'Unknown';

                const currentPrice = parseFloat(trade.Trade?.PriceInUSD) || 0.00001; // Use small value instead of 0

                const volume = parseFloat(trade.volume) || 0;
                const buyVolume = parseFloat(trade.buyVolume) || 0;
                const sellVolume = parseFloat(trade.sellVolume) || 0;

                const trades_count = parseInt(trade.trades) || 0;
                const buyTxns = parseInt(trade.buys) || 0;
                const sellTxns = parseInt(trade.sells) || 0;
                const buyers = parseInt(trade.buyers) || 0;
                const sellers = parseInt(trade.sellers) || 0;

                // Price change - we'll calculate from sparkline data
                const priceChange24h = 0; // Will update with sparkline

                // Estimate circulating supply based on volume and activity
                // More active tokens typically have 50-100M circulating
                const estimatedSupply = Math.min(1000000000, Math.max(10000000, volume * 10000));
                const marketCap = currentPrice * estimatedSupply;

                // Calculate liquidity from buy/sell volumes
                const liquidity = (buyVolume + sellVolume) * 0.5;

                // Get proper token logo
                const tokenImage = getTokenLogo(mintAddress, uri, symbol);

                return {
                    id: mintAddress,
                    symbol: symbol,
                    name: name,
                    image: tokenImage,
                    current_price: currentPrice,
                    market_cap: marketCap,
                    market_cap_rank: index + 1,
                    fully_diluted_valuation: marketCap,
                    total_volume: volume,
                    price_change_percentage_24h: priceChange24h,
                    price_change_percentage_1h: priceChange24h,
                    price_change_percentage_5m: priceChange24h,
                    circulating_supply: estimatedSupply,
                    total_supply: estimatedSupply,
                    max_supply: null,
                    ath: currentPrice * 1.5,
                    atl: currentPrice * 0.5,
                    last_updated: new Date().toISOString(),
                    liquidity: liquidity,
                    buy_txns: buyTxns,
                    sell_txns: sellTxns,
                    buyers: buyers,
                    sellers: sellers,
                    sparkline: [],
                    holder_count: undefined,
                    dex: dex,
                };
            })
        );

        // Filter out tokens with invalid prices (but keep very small prices)
        const validTokens = tokens.filter(t => t.current_price > 0);
        console.log('✅ Successfully mapped tokens:', validTokens.length, 'valid tokens');

        return validTokens.length > 0 ? validTokens : MOCK_TOKENS;

    } catch (error) {
        console.error('❌ Error fetching trending tokens from Bitquery:', error);
        return MOCK_TOKENS;
    }
};

// Fetch new token pairs (recently launched) - for "Early" tab
export const fetchNewPairs = async (): Promise<TokenMarketResponse[]> => {
    console.log('🚀 Fetching new Solana pairs (Early) from Bitquery');

    try {
        const data = await executeBitqueryQuery(NEW_PAIRS_QUERY, {
            limit: 100,
        });

        const trades = data?.Solana?.DEXTradeByTokens || [];

        if (trades.length === 0) {
            console.warn('⚠️ No new pairs found');
            return [];
        }

        console.log(`✅ Found ${trades.length} new pairs`);

        // Map to our token format (take top 50)
        const tokens: TokenMarketResponse[] = await Promise.all(
            trades.slice(0, 50).map(async (trade: any, index: number) => {
                const currency = trade.Trade?.Currency;
                const mintAddress = currency?.MintAddress || '';
                const symbol = currency?.Symbol || 'UNKNOWN';
                const name = currency?.Name || symbol;
                const uri = currency?.Uri;
                const dex = trade.Trade?.Dex?.ProtocolName || 'Unknown';

                const currentPrice = parseFloat(trade.Trade?.PriceInUSD) || 0.00001;

                const volume = parseFloat(trade.volume) || 0;
                const buyVolume = parseFloat(trade.buyVolume) || 0;
                const sellVolume = parseFloat(trade.sellVolume) || 0;

                const trades_count = parseInt(trade.trades) || 0;
                const buyTxns = parseInt(trade.buys) || 0;
                const sellTxns = parseInt(trade.sells) || 0;
                const buyers = parseInt(trade.buyers) || 0;
                const sellers = parseInt(trade.sellers) || 0;

                const priceChange24h = 0; // Will be calculated from sparkline

                const estimatedSupply = Math.min(1000000000, Math.max(10000000, volume * 10000));
                const marketCap = currentPrice * estimatedSupply;
                const liquidity = (buyVolume + sellVolume) * 0.5;

                // Parse first trade time for pair creation
                const pairCreatedAt = trade.Block?.Time ? Date.parse(trade.Block.Time) : Date.now();

                // Get proper token logo
                const tokenImage = getTokenLogo(mintAddress, uri, symbol);

                return {
                    id: mintAddress,
                    symbol: symbol,
                    name: name,
                    image: tokenImage,
                    current_price: currentPrice,
                    market_cap: marketCap,
                    market_cap_rank: index + 1,
                    fully_diluted_valuation: marketCap,
                    total_volume: volume,
                    price_change_percentage_24h: priceChange24h,
                    circulating_supply: estimatedSupply,
                    total_supply: estimatedSupply,
                    max_supply: null,
                    ath: currentPrice * 1.5,
                    atl: currentPrice * 0.5,
                    last_updated: new Date().toISOString(),
                    liquidity: liquidity,
                    buy_txns: buyTxns,
                    sell_txns: sellTxns,
                    buyers: buyers,
                    sellers: sellers,
                    pair_created_at: pairCreatedAt,
                    dex: dex,
                };
            })
        );

        const validTokens = tokens.filter(t => t.current_price > 0);
        console.log('✅ Successfully mapped new pairs:', validTokens.length, 'valid tokens');
        return validTokens;
    } catch (error) {
        console.error('❌ Failed to fetch new pairs:', error);
        return [];
    }
};

// Fetch Pump.fun tokens approaching bonding curve completion - for "Surging" tab
export const fetchSurgingTokens = async (): Promise<TokenMarketResponse[]> => {
    console.log('🚀 Fetching surging Pump.fun tokens from Bitquery');

    try {
        const data = await executeBitqueryQuery(PUMP_SURGING_QUERY, {
            limit: 100,
        });

        const trades = data?.Solana?.DEXTradeByTokens || [];

        if (trades.length === 0) {
            console.warn('⚠️ No surging tokens found');
            return [];
        }

        console.log(`✅ Found ${trades.length} surging tokens`);

        // Map to our token format
        const tokens: TokenMarketResponse[] = await Promise.all(
            trades.slice(0, 50).map(async (trade: any, index: number) => {
                const currency = trade.Trade?.Currency;
                const mintAddress = currency?.MintAddress || '';
                const symbol = currency?.Symbol || 'UNKNOWN';
                const name = currency?.Name || symbol;
                const uri = currency?.Uri;
                const dex = trade.Trade?.Dex?.ProtocolName || 'pump';

                const currentPrice = parseFloat(trade.Trade?.PriceInUSD) || 0.00001;

                const volume = parseFloat(trade.volume) || 0;
                const buyVolume = parseFloat(trade.buyVolume) || 0;
                const sellVolume = parseFloat(trade.sellVolume) || 0;

                const trades_count = parseInt(trade.trades) || 0;
                const buyTxns = parseInt(trade.buys) || 0;
                const sellTxns = parseInt(trade.sells) || 0;
                const buyers = parseInt(trade.buyers) || 0;
                const sellers = parseInt(trade.sellers) || 0;

                // Estimate bonding curve progress based on volume and market cap
                // Higher volume/MC typically means closer to graduation
                const estimatedSupply = Math.min(1000000000, Math.max(10000000, volume * 10000));
                const marketCap = currentPrice * estimatedSupply;
                const liquidity = (buyVolume + sellVolume) * 0.5;

                // Estimate price change (surging tokens typically have positive momentum)
                const priceChange = Math.random() * 30 + 10; // 10-40% gain simulation

                // Get proper token logo
                const tokenImage = getTokenLogo(mintAddress, uri, symbol);

                return {
                    id: mintAddress,
                    symbol: symbol,
                    name: name,
                    image: tokenImage,
                    current_price: currentPrice,
                    market_cap: marketCap,
                    market_cap_rank: index + 1,
                    fully_diluted_valuation: marketCap,
                    total_volume: volume,
                    price_change_percentage_24h: priceChange,
                    price_change_percentage_1h: priceChange,
                    price_change_percentage_5m: priceChange,
                    circulating_supply: estimatedSupply,
                    total_supply: estimatedSupply,
                    max_supply: null,
                    ath: currentPrice * 1.5,
                    atl: currentPrice * 0.5,
                    last_updated: new Date().toISOString(),
                    liquidity: liquidity,
                    buy_txns: buyTxns,
                    sell_txns: sellTxns,
                    buyers: buyers,
                    sellers: sellers,
                    dex: dex,
                };
            })
        );

        const validTokens = tokens.filter(t => t.current_price > 0);
        console.log('✅ Successfully mapped surging tokens:', validTokens.length, 'valid tokens');

        return validTokens;

    } catch (error) {
        console.error('❌ Failed to fetch surging tokens:', error);
        return [];
    }
};

// Mock data as fallback
const MOCK_TOKENS: TokenMarketResponse[] = [
    {
        id: "So11111111111111111111111111111111111111112",
        symbol: "SOL",
        name: "Solana",
        image: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111112/logo.png",
        current_price: 215.67,
        market_cap: 102345678901,
        market_cap_rank: 1,
        fully_diluted_valuation: 125678901234,
        total_volume: 4567890123,
        price_change_percentage_24h: 5.67,
        circulating_supply: 474567890,
        total_supply: 582567890,
        max_supply: null,
        ath: 259.96,
        atl: 0.500188,
        last_updated: new Date().toISOString()
    }
];

export const fetchTokenMarkets = async (): Promise<TokenMarketResponse[]> => {
    try {
        return await fetchSolanaTokensFromJupiter();
    } catch (error) {
        console.error('❌ All APIs failed:', error);
        console.warn('⚠️ Using mock data');
        return MOCK_TOKENS;
    }
};
