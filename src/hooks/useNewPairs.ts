import { useQuery } from "@tanstack/react-query";
import { fetchNewPairs } from "@/lib/api-client";
import type { TokenMarketResponse } from "@/types/api";

export const useNewPairs = () => {
    return useQuery<TokenMarketResponse[], Error>({
        queryKey: ["newPairs"],
        queryFn: fetchNewPairs,
        staleTime: parseInt(process.env.NEXT_PUBLIC_STALE_TIME || "10000"),
        gcTime: parseInt(process.env.NEXT_PUBLIC_API_CACHE_TIME || "30000"),
        refetchInterval: 45000, // Refetch every 45 seconds
        retry: 2,
    });
};
