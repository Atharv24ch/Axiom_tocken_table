import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface IconProps extends React.HTMLAttributes<SVGElement> {
    icon: LucideIcon;
    size?: "sm" | "md" | "lg";
}

const SIZE_MAP: Record<Required<IconProps>["size"], string> = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
};

export const Icon = ({ icon: IconComponent, size = "md", className, ...props }: IconProps) => {
    return <IconComponent className={cn(SIZE_MAP[size], className)} aria-hidden {...props} />;
};
