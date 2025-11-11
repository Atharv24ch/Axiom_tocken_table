import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn, formatNumber, formatPercent } from "@/lib/utils";
import { Text } from "@/components/atoms/Text";

export interface PriceDisplayProps {
    price: number;
    change24h: number;
    className?: string;
}

export const PriceDisplay = ({ price, change24h, className }: PriceDisplayProps) => {
    const isPositive = change24h > 0;
    const isNegative = change24h < 0;
    const ChangeIcon = isPositive ? ArrowUpRight : isNegative ? ArrowDownRight : Minus;

    return (
        <div className={cn("flex flex-col gap-0.5", className)}>
            <div className="text-sm font-medium text-white">
                ${formatNumber(price, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
            </div>
            <div className="flex items-center gap-1">
                <ChangeIcon
                    className={cn(
                        "h-3.5 w-3.5",
                        isPositive && "text-green-500",
                        isNegative && "text-red-500",
                        !isPositive && !isNegative && "text-gray-500"
                    )}
                    aria-hidden
                />
                <span className={cn(
                    "text-xs font-medium",
                    isPositive && "text-green-500",
                    isNegative && "text-red-500",
                    !isPositive && !isNegative && "text-gray-500"
                )}>
                    {formatPercent(change24h / 100)}
                </span>
            </div>
        </div>
    );
};
