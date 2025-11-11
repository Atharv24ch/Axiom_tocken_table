"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";

export interface FilterChipProps {
    label: string;
    onRemove?: () => void;
}

export const FilterChip = ({ label, onRemove }: FilterChipProps) => {
    return (
        <Badge variant="secondary" className="flex items-center gap-1">
            {label}
            {onRemove && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="h-5 w-5 p-0"
                    onClick={onRemove}
                    aria-label={`Remove ${label} filter`}
                    leftIcon={<X className="h-3 w-3" aria-hidden />}
                />
            )}
        </Badge>
    );
};
