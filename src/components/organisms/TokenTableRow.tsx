"use client";

import * as React from "react";
import type { NewPairToken } from "@/types/token";
import { PriceDisplay } from "@/components/molecules/PriceDisplay";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";

export interface TokenTableRowProps {
    token: NewPairToken;
    onSelect?: (id: string) => void;
    onDoubleClick?: () => void;
}

export const TokenTableRow = React.memo(function TokenTableRow({ token, onSelect, onDoubleClick }: TokenTableRowProps) {
    const handleClick = () => onSelect?.(token.id);

    return (
        <div
            role="row"
            onClick={handleClick}
            onDoubleClick={onDoubleClick}
            className={cn(
                "flex w-full items-center gap-4 px-4 py-3.5 hover:bg-white/5 transition-colors cursor-pointer",
                "border-b border-[rgb(38,38,42)]"
            )}
        >
            {/* Token icon */}
            <div className="w-10 flex-shrink-0">
                <img
                    src={token.iconUrl ?? "/vercel.svg"}
                    alt={token.symbol}
                    className="h-8 w-8 rounded-full"
                />
            </div>

            {/* Token name */}
            <div className="min-w-[180px] flex-1">
                <div className="flex flex-col">
                    <div className="text-sm font-semibold text-white">{token.symbol}</div>
                    <div className="text-xs text-gray-500 truncate">{token.name}</div>
                </div>
            </div>

            {/* Price with change */}
            <div className="w-32">
                <PriceDisplay price={token.priceUsd} change24h={token.change24h} />
            </div>

            {/* Volume */}
            <div className="w-32 text-right">
                <div className="text-sm text-gray-300">${formatNumber(token.volume24h)}</div>
            </div>

            {/* Liquidity */}
            <div className="w-32 text-right">
                <div className="text-sm text-gray-300">${formatNumber(token.liquidity)}</div>
            </div>

            {/* Created */}
            <div className="w-32 text-right">
                <div className="text-xs text-gray-500">
                    {new Date(token.launchTimestamp).toLocaleDateString()}
                </div>
            </div>
        </div>
    );
});

TokenTableRow.displayName = "TokenTableRow";
