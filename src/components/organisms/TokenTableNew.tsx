"use client";

import * as React from "react";
import Image from "next/image";
import { useTokens, useNewPairs, useSurgingTokens } from "@/hooks/useTokens";
import { MiniChart } from "@/components/atoms/MiniChart";
import type { TokenMarketResponse } from "@/types/api";

// Client-only wrapper to prevent hydration mismatches
function ClientOnly({ children }: { children: React.ReactNode }) {
    const [hasMounted, setHasMounted] = React.useState(false);

    React.useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return null;
    }

    return <>{children}</>;
}

interface TokenTableProps {
    mode?: "trending" | "surge";
}

// Token Logo Component with metadata fetching and multiple fallbacks
function TokenLogo({ src, symbol, size = 44 }: { src: string; symbol: string; size?: number }) {
    const [imgSrc, setImgSrc] = React.useState<string>('');
    const [attempts, setAttempts] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(true);

    const fallbackSources = React.useMemo(() => {
        // Extract mint address from DexScreener URL or direct address
        const mintMatch = src.match(/tokens\/solana\/([^.]+)/);
        const mintAddress = mintMatch ? mintMatch[1] : src;

        return [
            `https://dd.dexscreener.com/ds-data/tokens/solana/${mintAddress}.png`,
            `https://img-cdn.magiceden.dev/rs:fill:400:400:0:0/plain/https://bafybeihzvn3zsi7vufml7v5z5rxye4ttf4jkjcutpmhxjl7dwqit2wgv54.ipfs.nftstorage.link/${mintAddress}.png`,
            `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${mintAddress}/logo.png`,
            `https://ui-avatars.com/api/?name=${encodeURIComponent(symbol)}&background=random&size=128&bold=true`
        ];
    }, [src, symbol]);

    // Fetch metadata if URI points to JSON
    React.useEffect(() => {
        const fetchImageFromMetadata = async () => {
            try {
                // Check if the src is a potential metadata URL (http/https/ipfs)
                if (src.includes('.json') || src.includes('ipfs://') || src.includes('arweave.net')) {
                    let metadataUrl = src;

                    // Convert IPFS URIs
                    if (src.startsWith('ipfs://')) {
                        metadataUrl = `https://ipfs.io/ipfs/${src.replace('ipfs://', '')}`;
                    } else if (src.startsWith('ar://')) {
                        metadataUrl = `https://arweave.net/${src.replace('ar://', '')}`;
                    }

                    console.log(`🔍 Fetching metadata for ${symbol}:`, metadataUrl);

                    const response = await fetch(metadataUrl);
                    const metadata = await response.json();

                    // Try to get image from metadata
                    const imageUrl = metadata.image || metadata.icon || metadata.logo_uri || metadata.logoURI;

                    if (imageUrl) {
                        // Convert IPFS image URLs
                        let finalImageUrl = imageUrl;
                        if (imageUrl.startsWith('ipfs://')) {
                            finalImageUrl = `https://ipfs.io/ipfs/${imageUrl.replace('ipfs://', '')}`;
                        }
                        console.log(`✅ Found image in metadata:`, finalImageUrl);
                        setImgSrc(finalImageUrl);
                        setIsLoading(false);
                        return;
                    }
                }

                // If not metadata or no image found, use first fallback
                setImgSrc(fallbackSources[0]);
                setIsLoading(false);
            } catch (error) {
                console.warn(`⚠️ Failed to fetch metadata for ${symbol}:`, error);
                // Use first fallback on error
                setImgSrc(fallbackSources[0]);
                setIsLoading(false);
            }
        };

        fetchImageFromMetadata();
    }, [src, symbol, fallbackSources]);

    const handleError = () => {
        if (attempts < fallbackSources.length - 1) {
            const nextAttempt = attempts + 1;
            console.log(`⚠️ Image failed for ${symbol}, trying fallback ${nextAttempt}`);
            setAttempts(nextAttempt);
            setImgSrc(fallbackSources[nextAttempt]);
        }
    };

    if (isLoading || !imgSrc) {
        return (
            <div
                className="rounded-lg border border-gray-700 bg-gray-800 flex items-center justify-center"
                style={{ width: size, height: size }}
                suppressHydrationWarning
            >
                <span className="text-xs text-gray-500">{symbol.slice(0, 2)}</span>
            </div>
        );
    }

    return (
        <img
            src={imgSrc}
            alt={symbol}
            className="rounded-lg border border-gray-700 object-cover"
            style={{ width: size, height: size }}
            onError={handleError}
        />
    );
}

export default function TokenTable({ mode = "trending" }: TokenTableProps) {
    // Always call all hooks unconditionally (React rule)
    const trendingQuery = useTokens();
    const surgingQuery = useSurgingTokens();
    const earlyQuery = useNewPairs();

    // Determine which data to use based on mode
    const isLoading = mode === "surge"
        ? (surgingQuery.isLoading || earlyQuery.isLoading)
        : trendingQuery.isLoading;

    const displayTokens = React.useMemo(() => {
        if (mode === "trending") {
            const tokens = trendingQuery.data || [];
            // For trending, sort by volume
            return [...tokens].sort((a, b) => (b.total_volume || 0) - (a.total_volume || 0));
        }
        return [];
    }, [mode, trendingQuery.data]);

    if (isLoading) {
        return (
            <ClientOnly>
                <div className="flex items-center justify-center py-20" suppressHydrationWarning>
                    <div className="text-gray-400" suppressHydrationWarning>
                        Loading tokens...
                    </div>
                </div>
            </ClientOnly>
        );
    }

    if (mode === "surge") {
        return (
            <ClientOnly>
                <SurgeView earlyTokens={earlyQuery.data || []} surgingTokens={surgingQuery.data || []} />
            </ClientOnly>
        );
    }

    return (
        <ClientOnly>
            <TrendingTable tokens={displayTokens} />
        </ClientOnly>
    );
}

// Trending Table Component - Exact Axiom Layout
function TrendingTable({ tokens }: { tokens: TokenMarketResponse[] }) {
    return (
        <div className="bg-[#14151a] rounded-lg border border-gray-800 overflow-hidden" suppressHydrationWarning>
            {/* Table Header */}
            <div className="grid grid-cols-[300px_180px_140px_140px_120px_120px_220px_120px] gap-4 px-6 py-3 bg-[#0d0e12] border-b border-gray-800 text-sm text-gray-400" suppressHydrationWarning>
                <div>Pair Info</div>
                <div className="flex items-center gap-1">
                    Market Cap
                    <span className="text-xs">↓</span>
                </div>
                <div>Price</div>
                <div>Liquidity</div>
                <div>Volume</div>
                <div>TXNS</div>
                <div>Token Info</div>
                <div>Action</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-800" suppressHydrationWarning>
                {tokens.slice(0, 20).map((token, idx) => (
                    <TrendingRow key={`trending-${token.id}-${idx}`} token={token} />
                ))}
            </div>

            {tokens.length === 0 && (
                <div className="text-center py-20 text-gray-400" suppressHydrationWarning>
                    No tokens found
                </div>
            )}
        </div>
    );
}

// Trending Table Row - Exact Axiom Style
function TrendingRow({ token }: { token: TokenMarketResponse }) {
    const getTimeAgo = () => {
        // Use deterministic time based on token ID to avoid hydration issues
        const seed = token.id.charCodeAt(0) + token.id.charCodeAt(1);
        const days = seed % 180;
        if (days < 30) return `${days}d`;
        return `${Math.floor(days / 30)}mo`;
    };

    const formatNumber = (num: number, decimals = 1) => {
        if (num >= 1000000) return `$${(num / 1000000).toFixed(decimals)}M`;
        if (num >= 1000) return `$${(num / 1000).toFixed(decimals)}K`;
        return `$${num.toFixed(decimals)}`;
    };

    const formatPrice = (price: number) => {
        if (price >= 1) return `$${price.toFixed(2)}`;
        if (price >= 0.01) return `$${price.toFixed(4)}`;
        if (price >= 0.0001) return `$${price.toFixed(6)}`;
        return `$${price.toExponential(2)}`;
    };

    return (
        <div className="grid grid-cols-[300px_180px_140px_140px_120px_120px_220px_120px] gap-4 px-6 py-4 hover:bg-gray-900/30 transition-colors" suppressHydrationWarning>
            {/* Pair Info */}
            <div className="flex items-center gap-3" suppressHydrationWarning>
                <TokenLogo src={token.image} symbol={token.symbol} size={44} />
                <div className="min-w-0" suppressHydrationWarning>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white">{token.symbol}</span>
                        <span className="text-gray-400 text-sm truncate">{token.name}</span>
                        <span className="text-gray-600">📋</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">{getTimeAgo()}</span>
                        <button className="text-gray-500 hover:text-white">👥</button>
                        <button className="text-gray-500 hover:text-white">🌐</button>
                        <button className="text-gray-500 hover:text-white">📱</button>
                        <button className="text-gray-500 hover:text-white">🔍</button>
                    </div>
                </div>
            </div>

            {/* Market Cap with Sparkline */}
            <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-[100px] h-[30px]">
                        <MiniChart
                            data={token.sparkline && token.sparkline.length > 0 ? token.sparkline : undefined}
                            width={100}
                            height={30}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{formatNumber(token.market_cap)}</span>
                    <span className={`text-xs ${token.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {token.price_change_percentage_24h >= 0 ? '+' : ''}{(token.price_change_percentage_24h || 0).toFixed(2)}%
                    </span>
                </div>
            </div>

            {/* Price */}
            <div className="flex flex-col justify-center">
                <span className="text-white font-medium">{formatPrice(token.current_price)}</span>
                <span className={`text-xs ${token.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {token.price_change_percentage_24h >= 0 ? '↑' : '↓'} {Math.abs(token.price_change_percentage_24h || 0).toFixed(2)}%
                </span>
            </div>

            {/* Liquidity */}
            <div className="flex items-center text-sm text-white">
                {formatNumber(token.liquidity || token.market_cap * 0.1)}
            </div>

            {/* Volume */}
            <div className="flex items-center text-sm text-white">
                {formatNumber(token.total_volume)}
            </div>

            {/* TXNS */}
            <div className="flex items-center gap-1 text-sm">
                <span className="text-green-500">{token.buy_txns || (token.id.charCodeAt(0) % 50)}</span>
                <span className="text-gray-500">/</span>
                <span className="text-red-500">{token.sell_txns || (token.id.charCodeAt(1) % 30)}</span>
            </div>

            {/* Token Info - Multiple Percentage Indicators */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-red-500">📉 N/A</span>
                    <span className="text-green-500">📈 0%</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-green-500">📈 0%</span>
                    <span className="text-green-500">📈 0%</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-green-500">📈 0%</span>
                    <span className="text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded">💰 Paid</span>
                </div>
            </div>

            {/* Action */}
            <div className="flex items-center">
                <button className="w-full py-2 bg-[#5b7cff] hover:bg-[#4a6bef] rounded-lg font-medium text-sm text-white transition-colors">
                    Buy
                </button>
            </div>
        </div>
    );
}

// Surge View - Card Layout like Axiom with Early and Surging sections
function SurgeView({ earlyTokens, surgingTokens }: { earlyTokens: TokenMarketResponse[], surgingTokens: TokenMarketResponse[] }) {
    return (
        <div className="grid grid-cols-2 gap-6">
            {/* Early Section - New Pairs */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-4">Early</h2>
                <div className="space-y-3">
                    {earlyTokens.slice(0, 10).map((token, idx) => (
                        <SurgeCard key={`early-${token.id}-${idx}`} token={token} />
                    ))}
                </div>
            </div>

            {/* Surging Section - Approaching Bonding Curve */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-4">Surging</h2>
                <div className="space-y-3">
                    {surgingTokens.slice(0, 10).map((token, idx) => (
                        <SurgeCard key={`surging-${token.id}-${idx}`} token={token} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Surge Card Component - Exact Axiom Style
function SurgeCard({ token }: { token: TokenMarketResponse }) {
    const getTimeAgo = () => {
        // Use deterministic time based on token ID to avoid hydration issues
        const seed = token.id.charCodeAt(0) + token.id.charCodeAt(2);
        const minutes = seed % 480;
        if (minutes < 60) return `${minutes}s`;
        if (minutes < 1440) return `${Math.floor(minutes / 60)}m`;
        return `${Math.floor(minutes / 1440)}d`;
    };

    const formatMC = (num: number) => {
        if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
        if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
        return `$${num.toFixed(0)}`;
    };

    const formatPrice = (price: number) => {
        if (price >= 1) return `$${price.toFixed(2)}`;
        if (price >= 0.01) return `$${price.toFixed(4)}`;
        if (price >= 0.0001) return `$${price.toFixed(6)}`;
        return `$${price.toExponential(2)}`;
    };

    const mcPercentage = Math.min((token.market_cap / 1000000) * 10, 100);

    return (
        <div className="bg-[#14151a] rounded-lg border border-gray-800 p-4 hover:border-gray-700 transition-colors" suppressHydrationWarning>
            {/* Header */}
            <div className="flex items-start justify-between mb-3" suppressHydrationWarning>
                <div className="flex items-center gap-3" suppressHydrationWarning>
                    <TokenLogo src={token.image} symbol={token.symbol} size={56} />
                    <div suppressHydrationWarning>
                        <div className="font-semibold text-white text-sm">{token.symbol}</div>
                        <div className="text-xs text-gray-400 truncate max-w-[120px]">{token.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{token.dex || 'pump'}_pump</div>
                    </div>
                </div>
                <div className="text-xs text-gray-400">{getTimeAgo()}</div>
            </div>

            {/* Market Cap Progress */}
            <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <div className="text-xs text-gray-400 mb-1">MC / Price</div>
                        <div className="flex items-center gap-2">
                            <span className="text-green-500 font-semibold text-sm">{formatMC(token.market_cap)}</span>
                            <span className="text-white font-medium text-xs">{formatPrice(token.current_price)}</span>
                        </div>
                    </div>
                    <div className="w-[80px] h-[25px]">
                        <MiniChart
                            data={token.sparkline && token.sparkline.length > 0 ? token.sparkline : undefined}
                            width={80}
                            height={25}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs ${token.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {token.price_change_percentage_24h >= 0 ? '+' : ''}{(token.price_change_percentage_24h || 0).toFixed(2)}%
                    </span>
                </div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-cyan-500 rounded-full transition-all"
                        style={{ width: `${mcPercentage}%` }}
                    />
                </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                <div className="flex items-center gap-3">
                    <div>V {formatMC(token.total_volume)}</div>
                    <div>L {formatMC(token.liquidity || token.market_cap * 0.1)}</div>
                    <div>👥 {token.buyers || (token.id.charCodeAt(0) % 100)}</div>
                    <div>0️⃣ {token.buy_txns || (token.id.charCodeAt(1) % 50)}</div>
                </div>
                <div className="text-xs">
                    ATH {formatMC(token.ath)} <span className="text-green-500">1.0x</span>
                </div>
            </div>

            {/* Percentage Indicators */}
            <div className="flex items-center gap-2 mb-3 text-xs">
                <span className="text-green-500">📈 10%</span>
                <span className="text-green-500">📈 0%</span>
                <span className="text-green-500">📈 0%</span>
                <span className="text-green-500">📈 0%</span>
                <span className="text-red-500">📉 {(token.id.charCodeAt(2) % 30)}%</span>
            </div>

            {/* Action Button */}
            <button className="w-full py-2 bg-[#5b7cff] hover:bg-[#4a6bef] rounded-lg flex items-center justify-center transition-colors">
                <span className="text-lg">⚡</span>
            </button>
        </div>
    );
}
