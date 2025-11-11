export const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

export const FEATURE_FLAGS = {
    enableWebSocket: process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === "true",
    enableMockData: process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA !== "false",
};

export const PERFORMANCE_CONFIG = {
    apiCacheTime: Number(process.env.NEXT_PUBLIC_API_CACHE_TIME ?? 30000),
    staleTime: Number(process.env.NEXT_PUBLIC_STALE_TIME ?? 10000),
};
