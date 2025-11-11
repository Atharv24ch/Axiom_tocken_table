import { useEffect } from "react";
import { getMockWebSocket, type PriceUpdate } from "@/lib/mock-ws";
import { FEATURE_FLAGS } from "@/constants";

export const useMockPriceUpdates = (
    tokenIds: string[],
    onUpdate: (update: PriceUpdate) => void,
    enabled = FEATURE_FLAGS.enableWebSocket && FEATURE_FLAGS.enableMockData
) => {
    useEffect(() => {
        if (!enabled || tokenIds.length === 0) return;

        const ws = getMockWebSocket(tokenIds);
        const unsubscribe = ws.subscribe(onUpdate);
        ws.start();

        return () => {
            unsubscribe();
            ws.stop();
        };
    }, [tokenIds, onUpdate, enabled]);
};
