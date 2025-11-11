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
    // Log to see what URI we're getting
    if (uri) {
        console.log(`🖼️ Token ${symbol} URI:`, uri);
    }

    // Priority 1: Use URI from Bitquery if available and valid
    if (uri) {
        // Check if it's a direct image URL
        if (uri.startsWith('http://') || uri.startsWith('https://')) {
            return uri;
        }
        // Check if it's an IPFS or Arweave link
        if (uri.startsWith('ipfs://')) {
            return `https://ipfs.io/ipfs/${uri.replace('ipfs://', '')}`;
        }
        if (uri.startsWith('ar://')) {
            return `https://arweave.net/${uri.replace('ar://', '')}`;
        }
    }

    // Priority 2: Try DexScreener CDN (most reliable for Solana tokens)
    return `https://dd.dexscreener.com/ds-data/tokens/solana/${mintAddress}.png`;
};

// List of common stablecoins and wrapped tokens to exclude
const EXCLUDED_TOKENS = [
    "11111111111111111111111111111111", // Native SOL
    "So11111111111111111111111111111111111111112", // Wrapped SOL
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
    "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
    "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs", // Wrapped Ethereum (Wormhole)
    "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E", // Wrapped BTC (Wormhole)
    "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", // Marinade staked SOL
];

// GraphQL query for trending Solana tokens - Get tokens with highest buy pressure (momentum-based)
// Using individual DEXTrades to get more diverse tokens
const TRENDING_TOKENS_QUERY = `
query TrendingSolanaTokens($limit: Int!) {
  Solana {
    DEXTrades(
      orderBy: {descendingByField: "Block_Time"}
      limit: {count: $limit}
      where: {
        Trade: {
          Buy: {
            Currency: {
              MintAddress: {
                notIn: [
                  "11111111111111111111111111111111",
                  "So11111111111111111111111111111111111111112",
                  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
                  "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
                  "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E",
                  "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So"
                ]
              }
            }
            AmountInUSD: {gt: "100"}
          }
        }
      }
    ) {
      Block {
        Time
      }
      Trade {
        Buy {
          Currency {
            Symbol
            Name
            MintAddress
            Uri
          }
          Amount
          AmountInUSD
          PriceInUSD
          Account {
            Address
          }
        }
        Sell {
          Currency {
            Symbol
            Name
            MintAddress
          }
          Amount
          AmountInUSD
          Account {
            Address
          }
        }
        Dex {
          ProtocolName
          ProtocolFamily
        }
      }
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
          Currency: {
            MintAddress: {
              notIn: [
                "11111111111111111111111111111111",
                "So11111111111111111111111111111111111111112",
                "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
                "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
                "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E",
                "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So"
              ]
            }
          }
          AmountInUSD: {gt: "5"}
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

// GraphQL query for Pump.fun tokens (or all high-volume tokens as surging)
const PUMP_SURGING_QUERY = `
query PumpSurgingTokens($limit: Int!) {
  Solana {
    DEXTradeByTokens(
      orderBy: {descendingByField: "buyVolume"}
      limit: {count: $limit}
      where: {
        Trade: {
          Currency: {
            MintAddress: {
              notIn: [
                "11111111111111111111111111111111",
                "So11111111111111111111111111111111111111112",
                "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
                "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
                "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E",
                "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So"
              ]
            }
          }
          AmountInUSD: {gt: "10"}
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

// Fetch sparkline data for a token using recent trades
const fetchTokenSparkline = async (mintAddress: string): Promise<number[]> => {
    try {
        const SPARKLINE_QUERY = `
        query TokenSparkline($address: String!) {
          Solana {
            DEXTrades(
              orderBy: {ascendingByField: "Block_Time"}
              limit: {count: 30}
              where: {
                Trade: {
                  Buy: {
                    Currency: {
                      MintAddress: {is: $address}
                    }
                  }
                }
              }
            ) {
              Block {
                Time
              }
              Trade {
                Buy {
                  PriceInUSD
                }
              }
            }
          }
        }
        `;

        const data = await executeBitqueryQuery(SPARKLINE_QUERY, {
            address: mintAddress,
        });

        const trades = data?.Solana?.DEXTrades || [];

        if (trades.length === 0) {
            // Return empty array if no data - MiniChart will generate dummy data
            return [];
        }

        // Extract prices from trades
        const prices = trades
            .map((trade: any) => {
                const price = parseFloat(trade.Trade?.Buy?.PriceInUSD) || 0;
                return price;
            })
            .filter((p: number) => p > 0);

        // Return the price array - MiniChart handles empty/small arrays
        return prices.length > 0 ? prices : [];
    } catch (error) {
        console.error('Failed to fetch sparkline for', mintAddress, error);
        // Return empty array on error - MiniChart will generate dummy data
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
            limit: 500, // Get more trades to aggregate diverse tokens
        });

        console.log('Raw Bitquery response:', JSON.stringify(data, null, 2));

        const trades = data?.Solana?.DEXTrades || [];

        if (trades.length === 0) {
            console.warn('⚠️ No trending tokens found, using fallback');
            console.log('Full data object:', data);
            return MOCK_TOKENS;
        }

        console.log(`✅ Found ${trades.length} individual trades`);

        // Aggregate trades by token to calculate metrics
        const tokenMap = new Map<string, {
            currency: any;
            totalVolume: number;
            buyVolume: number;
            sellVolume: number;
            trades: number;
            buys: number;
            sells: number;
            buyers: Set<string>;
            sellers: Set<string>;
            lastPrice: number;
            uri?: string;
            dex: string;
        }>();

        // Aggregate all trades by mint address
        trades.forEach((trade: any) => {
            const buyCurrency = trade.Trade?.Buy?.Currency;
            const mintAddress = buyCurrency?.MintAddress || '';
            if (!mintAddress) return;

            const tradeAmount = parseFloat(trade.Trade?.Buy?.AmountInUSD) || 0;
            const price = parseFloat(trade.Trade?.Buy?.PriceInUSD) || 0;
            const buyer = trade.Trade?.Buy?.Account?.Address || '';
            const seller = trade.Trade?.Sell?.Account?.Address || '';
            const dex = trade.Trade?.Dex?.ProtocolName || 'Unknown';

            if (!tokenMap.has(mintAddress)) {
                const uri = buyCurrency?.Uri;
                console.log(`💎 New token found: ${buyCurrency?.Symbol} - URI: ${uri}`);

                tokenMap.set(mintAddress, {
                    currency: buyCurrency,
                    totalVolume: 0,
                    buyVolume: 0,
                    sellVolume: 0,
                    trades: 0,
                    buys: 0,
                    sells: 0,
                    buyers: new Set(),
                    sellers: new Set(),
                    lastPrice: price,
                    uri: uri,
                    dex,
                });
            }

            const tokenData = tokenMap.get(mintAddress)!;
            tokenData.totalVolume += tradeAmount;
            tokenData.trades += 1;
            tokenData.lastPrice = price; // Update to latest price
            tokenData.buyVolume += tradeAmount;
            tokenData.buys += 1;
            if (buyer) tokenData.buyers.add(buyer);
            if (seller) tokenData.sellers.add(seller);
        });

        console.log(`✅ Aggregated into ${tokenMap.size} unique tokens`);

        // Convert to array and sort by buy volume (trending = high buy pressure)
        const aggregatedTokens = Array.from(tokenMap.entries())
            .map(([mintAddress, data]) => ({
                mintAddress,
                ...data,
            }))
            .sort((a, b) => b.buyVolume - a.buyVolume)
            .slice(0, 50); // Take top 50 trending tokens

        // Map to our token format
        const tokens: TokenMarketResponse[] = await Promise.all(
            aggregatedTokens.map(async (tokenData, index: number) => {
                const currency = tokenData.currency;
                const mintAddress = tokenData.mintAddress;
                const symbol = currency?.Symbol || 'UNKNOWN';
                const name = currency?.Name || symbol;
                const uri = tokenData.uri;
                const dex = tokenData.dex;

                const currentPrice = tokenData.lastPrice || 0.00001; // Use small value instead of 0

                const volume = tokenData.totalVolume;
                const buyVolume = tokenData.buyVolume;
                const sellVolume = tokenData.sellVolume;

                const trades_count = tokenData.trades;
                const buyTxns = tokenData.buys;
                const sellTxns = tokenData.sells;
                const buyers = tokenData.buyers.size;
                const sellers = tokenData.sellers.size;

                // Fetch sparkline data for price chart (only for first 10 tokens to speed up)
                let sparklineData: number[] = [];
                let priceChange24h = 0;

                if (index < 10) {
                    // Fetch real sparkline data for first 10 tokens
                    try {
                        sparklineData = await fetchTokenSparkline(mintAddress);
                        console.log(`📊 Sparkline for ${symbol}: ${sparklineData.length} points`);

                        // Calculate price change from sparkline if we have data
                        if (sparklineData.length >= 2) {
                            const firstPrice = sparklineData[0];
                            const lastPrice = sparklineData[sparklineData.length - 1];
                            if (firstPrice > 0) {
                                priceChange24h = ((lastPrice - firstPrice) / firstPrice) * 100;
                            }
                        }
                    } catch (error) {
                        console.warn(`Could not fetch sparkline for ${symbol}:`, error);
                    }
                }

                // Fallback: Use buy/sell ratio for change indicator if no sparkline
                if (priceChange24h === 0 && buyVolume + sellVolume > 0) {
                    priceChange24h = ((buyVolume - sellVolume) / (buyVolume + sellVolume)) * 10;
                }

                // Generate realistic dummy sparkline if no real data
                if (sparklineData.length === 0) {
                    const basePrice = currentPrice;
                    const seed = mintAddress.charCodeAt(0) + mintAddress.charCodeAt(1); // Deterministic seed
                    sparklineData = Array.from({ length: 20 }, (_, i) => {
                        const variation = ((seed + i) % 10 - 5) * 0.02; // Deterministic ±10% variation
                        const trend = (priceChange24h / 100) * (i / 20); // Trend based on calculated change
                        return basePrice * (1 + trend + variation);
                    });
                }

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
                    sparkline: sparklineData,
                    holder_count: undefined,
                    dex: dex,
                };
            })
        );

        // Filter out tokens with invalid prices and deduplicate by mint address
        const seenMints = new Set<string>();
        const validTokens = tokens.filter(t => {
            // Filter invalid prices
            if (t.current_price <= 0) return false;

            // Filter excluded tokens (stablecoins, wrapped tokens)
            if (EXCLUDED_TOKENS.includes(t.id)) return false;

            // Filter by symbol (catch any remaining stablecoins)
            const excludedSymbols = ['USDC', 'USDT', 'WSOL', 'SOL', 'WETH', 'WBTC', 'MSOL'];
            if (excludedSymbols.includes(t.symbol.toUpperCase())) return false;

            // Deduplicate by mint address
            if (seenMints.has(t.id)) return false;
            seenMints.add(t.id);

            return true;
        });

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

        // Filter and deduplicate
        const seenMints = new Set<string>();
        const validTokens = tokens.filter(t => {
            if (t.current_price <= 0) return false;
            if (EXCLUDED_TOKENS.includes(t.id)) return false;
            const excludedSymbols = ['USDC', 'USDT', 'WSOL', 'SOL', 'WETH', 'WBTC', 'MSOL'];
            if (excludedSymbols.includes(t.symbol.toUpperCase())) return false;
            if (seenMints.has(t.id)) return false;
            seenMints.add(t.id);
            return true;
        });

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

        // Filter and deduplicate
        const seenMints = new Set<string>();
        const validTokens = tokens.filter(t => {
            if (t.current_price <= 0) return false;
            if (EXCLUDED_TOKENS.includes(t.id)) return false;
            const excludedSymbols = ['USDC', 'USDT', 'WSOL', 'SOL', 'WETH', 'WBTC', 'MSOL'];
            if (excludedSymbols.includes(t.symbol.toUpperCase())) return false;
            if (seenMints.has(t.id)) return false;
            seenMints.add(t.id);
            return true;
        });

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
