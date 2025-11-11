"use client";

import { ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";

export interface SortButtonProps {
    label: string;
    direction?: "asc" | "desc" | "none";
    onToggle: () => void;
    isActive?: boolean;
    className?: string;
}

export const SortButton = ({ label, direction = "none", onToggle, isActive = false, className }: SortButtonProps) => {
    const Icon = direction === "asc" ? ChevronUp : direction === "desc" ? ChevronDown : ArrowUpDown;

    return (
        <Button
            variant={isActive ? "secondary" : "ghost"}
            size="sm"
            onClick={onToggle}
            className={cn("h-8 px-2 text-xs uppercase tracking-wide", className)}
            leftIcon={<Icon className="h-4 w-4" aria-hidden />}
        >
            {label}
        </Button>
    );
};
