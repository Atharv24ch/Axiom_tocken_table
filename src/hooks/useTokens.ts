import { useQuery } from "@tanstack/react-query";
import { fetchTokenMarkets, fetchNewPairs, fetchSurgingTokens } from "@/lib/api-client";
import { FEATURE_FLAGS } from "@/constants";
import type { TokenMarketResponse } from "@/types/api";

const TOKENS_QUERY_KEY = ["tokens"] as const;
const NEW_PAIRS_QUERY_KEY = ["newPairs"] as const;
const SURGING_QUERY_KEY = ["surging"] as const;

// Hook for trending tokens (original)
export const useTokens = () => {
    return useQuery<TokenMarketResponse[]>({
        queryKey: TOKENS_QUERY_KEY,
        queryFn: fetchTokenMarkets,
        staleTime: Number(process.env.NEXT_PUBLIC_STALE_TIME ?? 10000),
        gcTime: Number(process.env.NEXT_PUBLIC_API_CACHE_TIME ?? 30000),
        refetchInterval: FEATURE_FLAGS.enableMockData ? 30000 : 45000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    });
};

// Hook for newly created pairs (Early tab)
export const useNewPairs = () => {
    return useQuery<TokenMarketResponse[]>({
        queryKey: NEW_PAIRS_QUERY_KEY,
        queryFn: fetchNewPairs,
        staleTime: Number(process.env.NEXT_PUBLIC_STALE_TIME ?? 10000),
        gcTime: Number(process.env.NEXT_PUBLIC_API_CACHE_TIME ?? 30000),
        refetchInterval: 30000, // Refresh every 30s for new pairs
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    });
};

// Hook for surging tokens approaching bonding curve (Surge tab)
export const useSurgingTokens = () => {
    return useQuery<TokenMarketResponse[]>({
        queryKey: SURGING_QUERY_KEY,
        queryFn: fetchSurgingTokens,
        staleTime: Number(process.env.NEXT_PUBLIC_STALE_TIME ?? 10000),
        gcTime: Number(process.env.NEXT_PUBLIC_API_CACHE_TIME ?? 30000),
        refetchInterval: 20000, // Refresh every 20s for surging tokens
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    });
};
