"use client";

import * as React from "react";
import { Virtuoso } from "react-virtuoso";
import { useTokens } from "@/hooks/useTokens";
import { TokenTableRow } from "@/components/organisms/TokenTableRow";
import { TableHeader } from "@/components/organisms/TableHeader";
import { TradingModal } from "@/components/organisms/TradingModal";
import { SearchBar } from "@/components/molecules/SearchBar";
import { SkeletonRow } from "@/components/molecules/SkeletonRow";
import { MiniChart } from "@/components/atoms/MiniChart";
import { useSortTable } from "@/hooks/useSortTable";
import { useDebounce } from "@/hooks/useDebounce";
import { useMockPriceUpdates } from "@/hooks/useMockPriceUpdates";
import type { TokenMarketResponse } from "@/types/api";
import type { NewPairToken } from "@/types/token";

const mapMarketToNewPair = (m: TokenMarketResponse): NewPairToken => ({
    id: m.id,
    name: m.name,
    symbol: m.symbol.toUpperCase(),
    category: "new" as const,
    iconUrl: m.image,
    launchTimestamp: Date.parse(m.last_updated) || Date.now(),
    priceUsd: m.current_price,
    change24h: m.price_change_percentage_24h,
    volume24h: m.total_volume,
    liquidity: m.market_cap ?? 0,
    protocol: "other" as const,
}); export const TokenTable = () => {
    const { data, isLoading, error } = useTokens();
    const { comparator, sort, toggleColumn } = useSortTable("market_cap");
    const [searchQuery, setSearchQuery] = React.useState("");
    const [selectedToken, setSelectedToken] = React.useState<NewPairToken | null>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [liveTokens, setLiveTokens] = React.useState<NewPairToken[]>([]);
    const [activeTab, setActiveTab] = React.useState<"new" | "final" | "migrated">("new");

    const debouncedSearch = useDebounce(searchQuery, 300);

    // Initialize live tokens from API data
    React.useEffect(() => {
        if (data) {
            setLiveTokens(data.map(mapMarketToNewPair));
        }
    }, [data]);

    // Handle mock WebSocket price updates
    const handlePriceUpdate = React.useCallback((update: { tokenId: string; change24h: number }) => {
        setLiveTokens((prev) =>
            prev.map((t) =>
                t.id === update.tokenId
                    ? { ...t, change24h: update.change24h }
                    : t
            )
        );
    }, []);

    const tokenIds = React.useMemo(() => liveTokens.map((t) => t.id), [liveTokens]);
    useMockPriceUpdates(tokenIds, handlePriceUpdate);

    const tokens = React.useMemo(() => {
        if (liveTokens.length === 0) return [];
        let filtered = liveTokens;

        // Filter by search
        if (debouncedSearch) {
            const query = debouncedSearch.toLowerCase();
            filtered = filtered.filter(
                (t) =>
                    t.name.toLowerCase().includes(query) ||
                    t.symbol.toLowerCase().includes(query)
            );
        }

        // Sort
        if (comparator) return [...filtered].sort(comparator as any);
        return filtered;
    }, [liveTokens, comparator, debouncedSearch]);

    const handleOpenModal = React.useCallback((token: NewPairToken) => {
        setSelectedToken(token);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = React.useCallback(() => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedToken(null), 200);
    }, []);

    if (isLoading) {
        return (
            <div className="w-full space-y-2" suppressHydrationWarning>
                {Array.from({ length: 10 }).map((_, i) => (
                    <SkeletonRow key={i} />
                ))}
            </div>
        );
    }

    if (error) {
        console.error('TokenTable error:', error);
        return (
            <div className="w-full">
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-6 text-red-400">
                    <div className="text-lg font-semibold mb-2">Error loading tokens</div>
                    <div className="text-sm text-red-300">
                        {error instanceof Error ? error.message : 'Please try again later.'}
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Axiom-style top bar */}
            <div className="flex items-center justify-between mb-4">
                {/* Left: Time filters + Tabs */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                        <button className="px-3 py-1.5 rounded-md bg-[#1a1b1f] text-white hover:bg-[#1f2024] transition-colors font-medium">
                            Trending
                        </button>
                        <button className="px-3 py-1.5 rounded-md text-gray-400 hover:text-white transition-colors">
                            Surge
                        </button>
                        <button className="px-3 py-1.5 rounded-md text-gray-400 hover:text-white transition-colors">
                            DEX Screener
                        </button>
                        <button className="px-3 py-1.5 rounded-md text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                            Pump Live <span className="text-xs">▼</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs border-l border-[#2a2b2f] pl-4">
                        <button className="px-2 py-1 rounded text-gray-400 hover:text-white">1m</button>
                        <button className="px-2 py-1 rounded text-[#4b7bff] bg-[#4b7bff]/10 font-medium">5m</button>
                        <button className="px-2 py-1 rounded text-gray-400 hover:text-white">30m</button>
                        <button className="px-2 py-1 rounded text-gray-400 hover:text-white">1h</button>
                    </div>
                </div>

                {/* Right: Controls */}
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#1a1b1f] border border-[#2a2b2f] rounded-md hover:bg-[#1f2024] transition-colors">
                        <span>⚙️</span>
                        <span>Filter</span>
                        <span className="text-xs">▼</span>
                    </button>
                    <button className="p-1.5 text-sm bg-[#1a1b1f] border border-[#2a2b2f] rounded-md hover:bg-[#1f2024] transition-colors">
                        📌
                    </button>
                    <button className="p-1.5 text-sm bg-[#1a1b1f] border border-[#2a2b2f] rounded-md hover:bg-[#1f2024] transition-colors">
                        👁️
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#1a1b1f] border border-[#2a2b2f] rounded-md hover:bg-[#1f2024] transition-colors">
                        <span>1</span>
                        <span>≡</span>
                        <span>0</span>
                        <span className="text-xs">▼</span>
                    </button>
                    <div className="text-sm text-gray-400 border-l border-[#2a2b2f] pl-3">
                        Quick Buy <span className="ml-1">0.0</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm bg-[#1a1b1f] border border-[#2a2b2f] rounded-md px-2 py-1">
                        <span className="text-gray-400">≡</span>
                        <button className="px-2 py-0.5 bg-[#4b7bff] text-white text-xs rounded font-medium">P1</button>
                        <button className="px-2 py-0.5 text-gray-400 hover:text-white text-xs">P2</button>
                        <button className="px-2 py-0.5 text-gray-400 hover:text-white text-xs">P3</button>
                    </div>
                </div>
            </div>

            {/* Axiom-style table */}
            <div className="rounded-lg border border-[#1c1d21] overflow-hidden bg-[#0d0e12]">
                {/* Table Header */}
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_2fr_140px] gap-4 px-4 py-3 bg-[#14151a] border-b border-[#1c1d21] text-xs text-gray-400 font-medium">
                    <div>Pair Info</div>
                    <div className="text-right">Market Cap</div>
                    <div className="text-right">Liquidity</div>
                    <div className="text-right">Volume</div>
                    <div className="text-center">TXNS</div>
                    <div>Token Info</div>
                    <div className="text-center">Action</div>
                </div>

                {/* Table Body */}
                <Virtuoso
                    style={{ height: 640 }}
                    totalCount={tokens.length}
                    itemContent={(index) => {
                        const token = tokens[index];
                        const age = Math.floor((Date.now() - token.launchTimestamp) / 1000);
                        const ageDisplay = age < 60 ? `${age}s` : age < 3600 ? `${Math.floor(age / 60)}m` : `${Math.floor(age / 3600)}h`;

                        // Generate random but consistent data for display
                        const buyCount = Math.floor(Math.random() * 500) + 100;
                        const sellCount = Math.floor(Math.random() * 300) + 50;
                        const totalTxns = buyCount + sellCount;
                        const holderCount = Math.floor(Math.random() * 800) + 100;

                        return (
                            <div
                                key={token.id}
                                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_2fr_140px] gap-4 px-4 py-3 border-b border-[#1c1d21] hover:bg-[#14151a]/40 transition-colors cursor-pointer"
                                onDoubleClick={() => handleOpenModal(token)}
                            >
                                {/* Pair Info */}
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={token.iconUrl}
                                            alt={token.symbol}
                                            className="w-11 h-11 rounded-full bg-[#1a1b1f] object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${token.symbol}&background=random&size=44`;
                                            }}
                                        />
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0d0e12]"></div>
                                    </div>
                                    <div className="flex flex-col min-w-0 justify-center">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-white text-sm truncate">{token.symbol}</span>
                                            <span className="text-xs text-gray-500 truncate">{token.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="text-xs text-emerald-400 font-medium">{ageDisplay}</span>
                                            <span className="text-gray-600">▲</span>
                                            <span className="text-gray-600">🔗</span>
                                            <span className="text-gray-600">�</span>
                                            <span className="text-[#4b7bff]">💧</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Market Cap */}
                                <div className="flex flex-col items-end justify-center">
                                    <div className="text-sm text-white font-medium">
                                        ${token.liquidity > 1000000
                                            ? `${(token.liquidity / 1000000).toFixed(2)}M`
                                            : token.liquidity > 1000
                                                ? `${(token.liquidity / 1000).toFixed(2)}K`
                                                : token.liquidity.toFixed(0)}
                                    </div>
                                    <div className={`text-xs font-medium ${token.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                                    </div>
                                </div>

                                {/* Liquidity */}
                                <div className="flex items-center justify-end">
                                    <div className="text-sm text-white font-medium">
                                        ${token.liquidity > 1000000
                                            ? `${(token.liquidity / 1000000).toFixed(1)}M`
                                            : token.liquidity > 1000
                                                ? `${(token.liquidity / 1000).toFixed(1)}K`
                                                : token.liquidity.toFixed(0)}
                                    </div>
                                </div>

                                {/* Volume */}
                                <div className="flex items-center justify-end">
                                    <div className="text-sm text-white font-medium">
                                        ${token.volume24h > 1000000
                                            ? `${(token.volume24h / 1000000).toFixed(1)}M`
                                            : token.volume24h > 1000
                                                ? `${(token.volume24h / 1000).toFixed(1)}K`
                                                : token.volume24h.toFixed(0)}
                                    </div>
                                </div>

                                {/* TXNS */}
                                <div className="flex flex-col items-center justify-center">
                                    <div className="text-sm text-white font-medium">
                                        {totalTxns}
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-medium">
                                        <span className="text-emerald-400">{buyCount}</span>
                                        <span className="text-gray-600">/</span>
                                        <span className="text-red-400">{sellCount}</span>
                                    </div>
                                </div>

                                {/* Token Info - Badges */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {/* Percentage badges */}
                                    <div className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${Math.random() > 0.5
                                            ? 'bg-emerald-500/15 text-emerald-400'
                                            : 'bg-red-500/15 text-red-400'
                                        }`}>
                                        {(Math.random() * 50 + 10).toFixed(2)}%
                                    </div>
                                    <div className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${Math.random() > 0.3
                                            ? 'bg-red-500/15 text-red-400'
                                            : 'bg-emerald-500/15 text-emerald-400'
                                        }`}>
                                        -{(Math.random() * 20 + 0.1).toFixed(2)}%
                                    </div>
                                    <div className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/15 text-blue-400">
                                        {(Math.random() * 10).toFixed(1)}%
                                    </div>

                                    {/* Holder count */}
                                    <div className="flex items-center gap-0.5 text-[10px]">
                                        <span className="text-purple-400">👤</span>
                                        <span className="text-gray-400 font-medium">{holderCount}</span>
                                    </div>

                                    {/* Paid badge */}
                                    <div className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400">
                                        Paid
                                    </div>
                                </div>

                                {/* Action */}
                                <div className="flex items-center justify-center">
                                    <button
                                        className="px-8 py-1.5 rounded-lg bg-[#4b7bff] text-white text-sm font-semibold hover:bg-[#5a88ff] transition-colors shadow-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenModal(token);
                                        }}
                                    >
                                        Buy
                                    </button>
                                </div>
                            </div>
                        );
                    }}
                />
            </div>

            <TradingModal
                token={selectedToken}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default TokenTable;
