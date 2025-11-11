export type TokenCategory = "new" | "final-stretch" | "migrated";

export interface BaseToken {
    id: string;
    name: string;
    symbol: string;
    category: TokenCategory;
    iconUrl?: string;
    launchTimestamp: number;
}

export interface NewPairToken extends BaseToken {
    priceUsd: number;
    change24h: number;
    change1h?: number;
    change5m?: number;
    volume24h: number;
    liquidity: number;
    protocol: "pumpfun" | "moonshot" | "other";
    buyTxns?: number;
    sellTxns?: number;
    holderCount?: number;
    sparkline?: number[];
    pairAddress?: string;
    pairCreatedAt?: number;
}

export interface FinalStretchToken extends BaseToken {
    bondingProgress: number;
    timeRemainingSeconds: number;
    topHoldersShare: number;
    developerHoldingsShare: number;
}

export interface MigratedToken extends BaseToken {
    migrationStatus: "pending" | "completed";
    liquidityPoolUrl?: string;
    chartUrl?: string;
}

export type Token = NewPairToken | FinalStretchToken | MigratedToken;
