import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export type SortDirection = "asc" | "desc";
export interface SortStateItem {
    key: string;
    direction: SortDirection;
}

/**
 * Very small sort state hook that persists the first sort column to URL params.
 * - returns sort state and a toggle function for a column
 */
export const useSortTable = (defaultKey?: string) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    // Initialize sort state as undefined to match server render
    const [sort, setSort] = useState<SortStateItem | undefined>(undefined);

    // Hydrate from URL params only on client after mount
    useEffect(() => {
        setIsClient(true);
        const sortKey = searchParams?.get("sort") ?? defaultKey ?? undefined;
        const sortDir = (searchParams?.get("dir") as SortDirection) ?? "desc";
        if (sortKey) {
            setSort({ key: sortKey, direction: sortDir });
        }
    }, [searchParams, defaultKey]);

    useEffect(() => {
        // Keep URL in sync when sort changes (only on client)
        if (!isClient) return;
        const params = new URLSearchParams(Array.from(searchParams ?? new URLSearchParams()));
        if (sort) {
            params.set("sort", sort.key);
            params.set("dir", sort.direction);
        } else {
            params.delete("sort");
            params.delete("dir");
        }
        const url = `${location.pathname}?${params.toString()}`;
        router.replace(url);
    }, [sort, isClient, searchParams, router]);

    const toggleColumn = useCallback((key: string) => {
        setSort((prev) => {
            if (!prev || prev.key !== key) {
                return { key, direction: "desc" };
            }
            return { key, direction: prev.direction === "desc" ? "asc" : "desc" };
        });
    }, []);

    const comparator = useMemo(() => {
        if (!sort) return undefined;
        return (a: Record<string, any>, b: Record<string, any>) => {
            const aVal = a[sort.key];
            const bVal = b[sort.key];
            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return 1;
            if (bVal == null) return -1;
            if (aVal === bVal) return 0;
            const cmp = aVal > bVal ? 1 : -1;
            return sort.direction === "asc" ? cmp : -cmp;
        };
    }, [sort]);

    return { sort, toggleColumn, comparator } as const;
};
