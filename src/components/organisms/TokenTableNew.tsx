"use client";

import * as React from "react";
import { useTokens, useNewPairs, useSurgingTokens } from "@/hooks/useTokens";
import type { TokenMarketResponse } from "@/types/api";

interface TokenTableProps {
    mode?: "trending" | "surge" | "early";
}

export default function TokenTable({ mode = "trending" }: TokenTableProps) {
    // Use the appropriate hook based on mode
    const trendingQuery = useTokens();
    const surgingQuery = useSurgingTokens();
    const earlyQuery = useNewPairs();

    // Select the correct query based on mode
    const query = mode === "surge" ? surgingQuery : mode === "early" ? earlyQuery : trendingQuery;
    const { data: tokens, isLoading } = query;

    // Sort tokens based on mode
    const displayTokens = React.useMemo(() => {
        if (!tokens) return [];

        if (mode === "surge") {
            // For surge, sort by price change (highest gainers)
            return [...tokens].sort((a, b) =>
                Math.abs(b.price_change_percentage_24h || 0) - Math.abs(a.price_change_percentage_24h || 0)
            );
        }

        if (mode === "early") {
            // For early, already sorted by creation time from API
            return tokens;
        }

        // For trending, sort by volume
        return [...tokens].sort((a, b) => (b.total_volume || 0) - (a.total_volume || 0));
    }, [tokens, mode]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-gray-400">Loading tokens...</div>
            </div>
        );
    }

    // Show surge view for surge mode, trending table for trending and early
    if (mode === "surge") {
        return <SurgeView tokens={displayTokens} />;
    }

    return <TrendingTable tokens={displayTokens} mode={mode} />;
}

// Trending Table Component - Exact Axiom Layout
function TrendingTable({ tokens, mode }: { tokens: TokenMarketResponse[], mode?: "trending" | "early" }) {
    return (
        <div className="bg-[#14151a] rounded-lg border border-gray-800 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[300px_180px_140px_140px_120px_220px_120px] gap-4 px-6 py-3 bg-[#0d0e12] border-b border-gray-800 text-sm text-gray-400">
                <div>Pair Info</div>
                <div className="flex items-center gap-1">
                    {mode === "early" ? "Created" : "Market Cap"}
                    <span className="text-xs">↓</span>
                </div>
                <div>Liquidity</div>
                <div>Volume</div>
                <div>TXNS</div>
                <div>Token Info</div>
                <div>Action</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-800">
                {tokens.slice(0, 20).map((token) => (
                    <TrendingRow key={token.id} token={token} />
                ))}
            </div>

            {tokens.length === 0 && (
                <div className="text-center py-20 text-gray-400">
                    No tokens found
                </div>
            )}
        </div>
    );
}

// Trending Table Row - Exact Axiom Style
function TrendingRow({ token }: { token: TokenMarketResponse }) {
    const getTimeAgo = () => {
        const days = Math.floor(Math.random() * 180);
        if (days < 30) return `${days}d`;
        return `${Math.floor(days / 30)}mo`;
    };

    const formatNumber = (num: number, decimals = 1) => {
        if (num >= 1000000) return `$${(num / 1000000).toFixed(decimals)}M`;
        if (num >= 1000) return `$${(num / 1000).toFixed(decimals)}K`;
        return `$${num.toFixed(decimals)}`;
    };

    return (
        <div className="grid grid-cols-[300px_180px_140px_140px_120px_220px_120px] gap-4 px-6 py-4 hover:bg-gray-900/30 transition-colors">
            {/* Pair Info */}
            <div className="flex items-center gap-3">
                <img
                    src={token.image}
                    alt={token.symbol}
                    className="w-11 h-11 rounded-lg border border-gray-700 object-cover"
                    onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${token.symbol}&background=random&size=128`;
                    }}
                />
                <div className="min-w-0">
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
                    <div className="flex-1">
                        <svg width="100" height="30" className="opacity-50">
                            <path
                                d={`M 0,${15 + Math.sin(0) * 10} ${Array.from({ length: 20 }, (_, i) =>
                                    `L ${i * 5},${15 + Math.sin(i * 0.5) * 10}`
                                ).join(' ')}`}
                                fill="none"
                                stroke={token.price_change_percentage_24h >= 0 ? '#10b981' : '#ef4444'}
                                strokeWidth="1.5"
                            />
                        </svg>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{formatNumber(token.market_cap)}</span>
                    <span className={`text-xs ${token.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {token.price_change_percentage_24h >= 0 ? '+' : ''}{(token.price_change_percentage_24h || 0).toFixed(2)}%
                    </span>
                </div>
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
                <span className="text-green-500">{token.buy_txns || Math.floor(Math.random() * 50)}</span>
                <span className="text-gray-500">/</span>
                <span className="text-red-500">{token.sell_txns || Math.floor(Math.random() * 30)}</span>
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

// Surge View - Card Layout like Axiom
function SurgeView({ tokens }: { tokens: TokenMarketResponse[] }) {
    const earlyTokens = tokens.slice(0, 10);
    const surgingTokens = tokens.slice(10, 20);

    return (
        <div className="grid grid-cols-2 gap-6">
            {/* Early Section */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-4">Early</h2>
                <div className="space-y-3">
                    {earlyTokens.map((token) => (
                        <SurgeCard key={token.id} token={token} />
                    ))}
                </div>
            </div>

            {/* Surging Section */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-4">Surging</h2>
                <div className="space-y-3">
                    {surgingTokens.map((token) => (
                        <SurgeCard key={token.id} token={token} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Surge Card Component - Exact Axiom Style
function SurgeCard({ token }: { token: TokenMarketResponse }) {
    const getTimeAgo = () => {
        const minutes = Math.floor(Math.random() * 480);
        if (minutes < 60) return `${minutes}s`;
        if (minutes < 1440) return `${Math.floor(minutes / 60)}m`;
        return `${Math.floor(minutes / 1440)}d`;
    };

    const formatMC = (num: number) => {
        if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
        if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
        return `$${num.toFixed(0)}`;
    };

    const mcPercentage = Math.min((token.market_cap / 1000000) * 10, 100);

    return (
        <div className="bg-[#14151a] rounded-lg border border-gray-800 p-4 hover:border-gray-700 transition-colors">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <img
                        src={token.image}
                        alt={token.symbol}
                        className="w-14 h-14 rounded-lg border border-gray-700 object-cover"
                        onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${token.symbol}&background=random&size=128`;
                        }}
                    />
                    <div>
                        <div className="font-semibold text-white text-sm">{token.symbol}</div>
                        <div className="text-xs text-gray-400 truncate max-w-[120px]">{token.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{token.dex || 'pump'}_pump</div>
                    </div>
                </div>
                <div className="text-xs text-gray-400">{getTimeAgo()}</div>
            </div>

            {/* Market Cap Progress */}
            <div className="mb-3">
                <div className="text-xs text-gray-400 mb-1">MC</div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-500 font-semibold text-sm">{formatMC(token.market_cap)}</span>
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
                    <div>👥 {token.buyers || Math.floor(Math.random() * 100)}</div>
                    <div>0️⃣ {token.buy_txns || Math.floor(Math.random() * 50)}</div>
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
                <span className="text-red-500">📉 {Math.floor(Math.random() * 30)}%</span>
            </div>

            {/* Action Button */}
            <button className="w-full py-2 bg-[#5b7cff] hover:bg-[#4a6bef] rounded-lg flex items-center justify-center transition-colors">
                <span className="text-lg">⚡</span>
            </button>
        </div>
    );
}
