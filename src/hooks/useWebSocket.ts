import { useEffect, useRef, useState } from "react";

interface WebSocketMessage<T> {
    type: string;
    payload: T;
}

interface UseWebSocketOptions<T> {
    url: string;
    onMessage?: (message: WebSocketMessage<T>) => void;
    enabled?: boolean;
    reconnectIntervalMs?: number;
}

export const useWebSocket = <T,>({
    url,
    onMessage,
    enabled = true,
    reconnectIntervalMs = 5000,
}: UseWebSocketOptions<T>) => {
    const [isConnected, setIsConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

    useEffect(() => {
        if (!enabled) {
            return undefined;
        }

        const connect = () => {
            wsRef.current?.close();
            const socket = new WebSocket(url);
            wsRef.current = socket;

            socket.onopen = () => setIsConnected(true);
            socket.onclose = () => {
                setIsConnected(false);
                if (enabled) {
                    reconnectTimeout.current = setTimeout(connect, reconnectIntervalMs);
                }
            };
            socket.onerror = () => socket.close();
            socket.onmessage = (event) => {
                try {
                    const parsed: WebSocketMessage<T> = JSON.parse(event.data);
                    onMessage?.(parsed);
                } catch (error) {
                    console.error("WebSocket message parse error", error);
                }
            };
        };

        connect();

        return () => {
            reconnectTimeout.current && clearTimeout(reconnectTimeout.current);
            wsRef.current?.close();
        };
    }, [enabled, onMessage, reconnectIntervalMs, url]);

    return {
        isConnected,
        send: (message: WebSocketMessage<T>) => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify(message));
            }
        },
    };
};
