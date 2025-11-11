import { useEffect, useRef } from "react";

interface UseInfiniteScrollOptions {
    onLoadMore: () => void;
    threshold?: number;
}

export const useInfiniteScroll = ({ onLoadMore, threshold = 0.5 }: UseInfiniteScrollOptions) => {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        observerRef.current?.disconnect();
        if (!loadMoreRef.current) {
            return undefined;
        }

        observerRef.current = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry?.isIntersecting) {
                onLoadMore();
            }
        }, { threshold });

        const observer = observerRef.current;
        const currentTarget = loadMoreRef.current;

        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            observer.disconnect();
        };
    }, [onLoadMore, threshold]);

    return loadMoreRef;
};
