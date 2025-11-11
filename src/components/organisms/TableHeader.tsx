"use client";

import * as React from "react";
import { SortButton } from "@/components/molecules/SortButton";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import type { SortDirection } from "@/hooks/useSortTable";

export interface TableHeaderProps {
    sortKey?: string;
    sortDirection?: SortDirection;
    onSort: (key: string) => void;
}

const columns = [
    { key: "name", label: "Token", tooltip: "Token name and symbol", sortable: true },
    { key: "current_price", label: "Price", tooltip: "Current price in USD with 24h change", sortable: true },
    { key: "total_volume", label: "Volume 24h", tooltip: "Total trading volume in last 24 hours", sortable: true },
    { key: "market_cap", label: "Liquidity", tooltip: "Market capitalization (liquidity proxy)", sortable: true },
    { key: "last_updated", label: "Created", tooltip: "Last update timestamp", sortable: true },
];

export const TableHeader = ({ sortKey, sortDirection, onSort }: TableHeaderProps) => {
    return (
        <TooltipProvider delayDuration={200}>
            <div
                role="row"
                className="flex w-full items-center gap-4 border-b border-[rgb(38,38,42)] bg-[rgb(20,20,24)] px-4 py-3"
            >
                {/* Token icon placeholder */}
                <div className="w-10 flex-shrink-0" aria-hidden />

                {columns.map((col) => {
                    const isActive = sortKey === col.key;
                    const direction = isActive ? sortDirection : "none";

                    return (
                        <div
                            key={col.key}
                            className={col.key === "name" ? "min-w-[180px] flex-1" : "w-32"}
                        >
                            {col.sortable ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div>
                                            <SortButton
                                                label={col.label}
                                                direction={direction}
                                                isActive={isActive}
                                                onToggle={() => onSort(col.key)}
                                            />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="bg-[rgb(30,30,36)] border-[rgb(50,50,54)]">
                                        <p className="text-xs text-gray-300">{col.tooltip}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ) : (
                                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    {col.label}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </TooltipProvider>
    );
};
