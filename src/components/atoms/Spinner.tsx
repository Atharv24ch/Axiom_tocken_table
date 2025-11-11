import { cn } from "@/lib/utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "xs" | "sm" | "md" | "lg";
}

const SIZE_MAP: Record<Required<SpinnerProps>["size"], string> = {
    xs: "h-3 w-3 border-2",
    sm: "h-4 w-4 border-2",
    md: "h-5 w-5 border-2",
    lg: "h-6 w-6 border-[3px]",
};

export const Spinner = ({ size = "md", className, ...props }: SpinnerProps) => {
    return (
        <div
            role="status"
            aria-live="polite"
            className={cn(
                "inline-block animate-spin rounded-full border-muted border-t-transparent",
                SIZE_MAP[size],
                className
            )}
            {...props}
        >
            <span className="sr-only">Loading</span>
        </div>
    );
};
