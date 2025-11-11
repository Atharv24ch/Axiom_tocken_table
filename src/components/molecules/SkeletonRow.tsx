import { cn } from "@/lib/utils";

export interface SkeletonRowProps {
    className?: string;
}

export const SkeletonRow = ({ className }: SkeletonRowProps) => {
    return (
        <div
            className={cn(
                "h-12 w-full animate-shimmer rounded-md bg-gradient-to-r from-muted/60 via-muted to-muted/60",
                "bg-[length:200%_100%]",
                className
            )}
            suppressHydrationWarning
        />
    );
};
