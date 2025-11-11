"use client";

import * as React from "react";
import { Virtuoso } from "react-virtuoso";
import { useNewPairs } from "@/hooks/useNewPairs";
import { TradingModal } from "@/components/organisms/TradingModal";
import { SkeletonRow } from "@/components/molecules/SkeletonRow";
import { MiniChart } from "@/components/atoms/MiniChart";
import { useSortTable } from "@/hooks/useSortTable";
import { useDebounce } from "@/hooks/useDebounce";
import type { TokenMarketResponse } from "@/types/api";
import type { NewPairToken } from "@/types/token";

const mapMarketToNewPair = (m: TokenMarketResponse): NewPairToken => ({
    id: m.id,
    name: m.name,
    symbol: m.symbol.toUpperCase(),
    category: "new" as const,
    iconUrl: m.image,
    launchTimestamp: m.pair_created_at ?? (Date.parse(m.last_updated) || Date.now()),
    priceUsd: m.current_price,
    change24h: m.price_change_percentage_24h,
    change1h: m.price_change_percentage_1h,
    change5m: m.price_change_percentage_5m,
    volume24h: m.total_volume,
    liquidity: m.liquidity || m.market_cap || 0,
    protocol: "other" as const,
    buyTxns: m.buy_txns,
    sellTxns: m.sell_txns,
    holderCount: m.holder_count,
    sparkline: m.sparkline ?? [],
    pairAddress: m.pair_address,
    pairCreatedAt: m.pair_created_at,
});

export const NewPairsTable = () => {
    const { data, isLoading, error } = useNewPairs();
    const { comparator, sort, toggleColumn } = useSortTable("market_cap");
    const [searchQuery, setSearchQuery] = React.useState("");
    const debouncedSearch = useDebounce(searchQuery, 300);
    const [selectedToken, setSelectedToken] = React.useState<NewPairToken | null>(null);

    const tokens = React.useMemo(() => {
        if (!data) return [];
        return data.map(mapMarketToNewPair);
    }, [data]);

    const filteredAndSortedTokens = React.useMemo(() => {
        let result = tokens;

        if (debouncedSearch) {
            const lower = debouncedSearch.toLowerCase();
            result = result.filter(
                (t) =>
                    t.symbol.toLowerCase().includes(lower) ||
                    t.name.toLowerCase().includes(lower)
            );
        }

        return result.sort(comparator);
    }, [tokens, debouncedSearch, comparator]);

    const handleRowClick = (token: NewPairToken) => {
        setSelectedToken(token);
    };

    const handleRowDoubleClick = (token: NewPairToken) => {
        setSelectedToken(token);
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-red-400">
                Error loading new pairs: {error.message}
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col h-full">
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-800">
                    <input
                        type="text"
                        placeholder="Search new pairs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 bg-[#0d0e12] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    />
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_0.8fr_1.8fr_140px] gap-4 px-6 py-3 bg-[#14151a] text-sm text-gray-400 border-b border-gray-800">
                    <div
                        className="cursor-pointer hover:text-white flex items-center gap-1"
                        onClick={() => toggleColumn("name")}
                    >
                        Token {sort?.key === "name" && (sort?.direction === "asc" ? "↑" : "↓")}
                    </div>
                    <div
                        className="cursor-pointer hover:text-white flex items-center gap-1"
                        onClick={() => toggleColumn("age")}
                    >
                        Age {sort?.key === "age" && (sort?.direction === "asc" ? "↑" : "↓")}
                    </div>
                    <div
                        className="cursor-pointer hover:text-white flex items-center gap-1"
                        onClick={() => toggleColumn("priceUsd")}
                    >
                        Price {sort?.key === "priceUsd" && (sort?.direction === "asc" ? "↑" : "↓")}
                    </div>
                    <div
                        className="cursor-pointer hover:text-white flex items-center gap-1"
                        onClick={() => toggleColumn("change24h")}
                    >
                        24h {sort?.key === "change24h" && (sort?.direction === "asc" ? "↑" : "↓")}
                    </div>
                    <div
                        className="cursor-pointer hover:text-white flex items-center gap-1"
                        onClick={() => toggleColumn("volume24h")}
                    >
                        Volume {sort?.key === "volume24h" && (sort?.direction === "asc" ? "↑" : "↓")}
                    </div>
                    <div
                        className="cursor-pointer hover:text-white flex items-center gap-1"
                        onClick={() => toggleColumn("liquidity")}
                    >
                        Liq {sort?.key === "liquidity" && (sort?.direction === "asc" ? "↑" : "↓")}
                    </div>
                    <div>TXNs</div>
                    <div>Action</div>
                </div>

                {/* Table Body */}
                <div className="flex-1 overflow-hidden">
                    {isLoading ? (
                        <div className="p-4 space-y-2">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <SkeletonRow key={i} />
                            ))}
                        </div>
                    ) : filteredAndSortedTokens.length === 0 ? (
                        <div className="flex items-center justify-center h-64 text-gray-400">
                            No new pairs found
                        </div>
                    ) : (
                        <Virtuoso
                            style={{ height: "calc(100vh - 320px)" }}
                            data={filteredAndSortedTokens}
                            itemContent={(index, token) => (
                                <TokenRow
                                    key={token.id}
                                    token={token}
                                    onClick={() => handleRowClick(token)}
                                    onDoubleClick={() => handleRowDoubleClick(token)}
                                />
                            )}
                        />
                    )}
                </div>
            </div>

            {selectedToken && (
                <TradingModal
                    token={selectedToken}
                    isOpen={!!selectedToken}
                    onClose={() => setSelectedToken(null)}
                />
            )}
        </>
    );
};

interface TokenRowProps {
    token: NewPairToken;
    onClick: () => void;
    onDoubleClick: () => void;
}

const TokenRow: React.FC<TokenRowProps> = ({ token, onClick, onDoubleClick }) => {
    const formatPrice = (price: number) => {
        if (price < 0.01) return `$${price.toFixed(6)}`;
        if (price < 1) return `$${price.toFixed(4)}`;
        return `$${price.toFixed(2)}`;
    };

    const formatVolume = (vol: number) => {
        if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(2)}M`;
        if (vol >= 1_000) return `$${(vol / 1_000).toFixed(1)}K`;
        return `$${vol.toFixed(0)}`;
    };

    const formatAge = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        return `${minutes}m ago`;
    };

    const changeColor = token.change24h >= 0 ? "text-emerald-500" : "text-red-500";

    return (
        <div
            className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_0.8fr_1.8fr_140px] gap-4 px-6 py-4 hover:bg-[#1a1b1f] transition-colors border-b border-gray-900 cursor-pointer items-center"
            onClick={onClick}
            onDoubleClick={onDoubleClick}
        >
            {/* Token Name */}
            <div className="flex items-center gap-3">
                <img
                    src={token.iconUrl}
                    alt={token.symbol}
                    className="w-8 h-8 rounded-full"
                />
                <div>
                    <div className="font-medium text-white">{token.symbol}</div>
                    <div className="text-xs text-gray-500">{token.name}</div>
                </div>
            </div>

            {/* Age */}
            <div className="text-sm text-amber-500 font-medium">
                {formatAge(token.launchTimestamp)}
            </div>

            {/* Price with Chart */}
            <div className="flex items-center gap-2">
                {token.sparkline && token.sparkline.length > 0 && (
                    <MiniChart data={token.sparkline} width={50} height={20} />
                )}
                <span className="text-sm font-medium">{formatPrice(token.priceUsd)}</span>
            </div>

            {/* 24h Change */}
            <div className={`text-sm font-medium ${changeColor}`}>
                {token.change24h >= 0 ? "+" : ""}
                {token.change24h.toFixed(2)}%
            </div>

            {/* Volume */}
            <div className="text-sm">{formatVolume(token.volume24h)}</div>

            {/* Liquidity */}
            <div className="text-sm">{formatVolume(token.liquidity)}</div>

            {/* TXNs */}
            <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                    <span className="text-emerald-500">↑</span>
                    <span>{token.buyTxns || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-red-500">↓</span>
                    <span>{token.sellTxns || 0}</span>
                </div>
            </div>

            {/* Action */}
            <button
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded text-sm font-medium transition-colors"
                onClick={(e) => {
                    e.stopPropagation();
                    onDoubleClick();
                }}
            >
                Trade
            </button>
        </div>
    );
};

export default NewPairsTable;
