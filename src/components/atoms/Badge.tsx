"use client";

import * as React from "react";
import { Badge as ShadcnBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.ComponentPropsWithoutRef<typeof ShadcnBadge> {
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
}

export const Badge = ({ startIcon, endIcon, className, children, ...props }: BadgeProps) => {
    return (
        <ShadcnBadge className={cn("inline-flex items-center gap-1", className)} {...props}>
            {startIcon && <span aria-hidden>{startIcon}</span>}
            <span>{children}</span>
            {endIcon && <span aria-hidden>{endIcon}</span>}
        </ShadcnBadge>
    );
};
