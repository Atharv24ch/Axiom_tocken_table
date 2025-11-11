/**
 * Mock WebSocket service to simulate real-time price updates.
 * Emits random price changes every 2-5 seconds.
 */

export interface PriceUpdate {
    tokenId: string;
    priceUsd: number;
    change24h: number;
    timestamp: number;
}

type PriceUpdateCallback = (update: PriceUpdate) => void;

export class MockWebSocketService {
    private subscribers: Set<PriceUpdateCallback> = new Set();
    private intervalId?: NodeJS.Timeout;
    private tokenIds: string[] = [];

    constructor(tokenIds: string[] = []) {
        this.tokenIds = tokenIds;
    }

    setTokenIds(ids: string[]) {
        this.tokenIds = ids;
    }

    subscribe(callback: PriceUpdateCallback) {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    start() {
        if (this.intervalId) return;

        this.intervalId = setInterval(() => {
            if (this.tokenIds.length === 0 || this.subscribers.size === 0) return;

            // Pick a random token to update
            const randomToken = this.tokenIds[Math.floor(Math.random() * this.tokenIds.length)];

            // Generate random price change between -5% and +5%
            const changePercent = (Math.random() - 0.5) * 10;

            const update: PriceUpdate = {
                tokenId: randomToken!,
                priceUsd: Math.random() * 100, // Placeholder - should fetch current price
                change24h: changePercent,
                timestamp: Date.now(),
            };

            this.subscribers.forEach((callback) => callback(update));
        }, Math.random() * 3000 + 2000); // Random interval 2-5s
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
        }
    }

    disconnect() {
        this.stop();
        this.subscribers.clear();
    }
}

// Singleton instance
let mockWsInstance: MockWebSocketService | null = null;

export const getMockWebSocket = (tokenIds: string[] = []): MockWebSocketService => {
    if (!mockWsInstance) {
        mockWsInstance = new MockWebSocketService(tokenIds);
    } else {
        mockWsInstance.setTokenIds(tokenIds);
    }
    return mockWsInstance;
};
