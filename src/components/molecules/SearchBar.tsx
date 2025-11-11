"use client";

import * as React from "react";
import { X, Search } from "lucide-react";
import { Input } from "@/components/atoms/Input";
import { Icon } from "@/components/atoms/Icon";
import { cn } from "@/lib/utils";

export interface SearchBarProps {
    value: string;
    placeholder?: string;
    onChange: (value: string) => void;
    onClear?: () => void;
    className?: string;
}

export const SearchBar = ({ value, placeholder, onChange, onClear, className }: SearchBarProps) => {
    const handleClear = () => {
        if (value.length === 0) return;
        onClear?.();
        onChange("");
    };

    return (
        <div className={cn("relative w-full", className)}>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <Search className="h-4 w-4" />
            </div>
            <input
                type="text"
                value={value}
                placeholder={placeholder ?? "Search tokens"}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-[rgb(20,20,24)] border border-[rgb(38,38,42)] rounded-lg pl-10 pr-10 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {value && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    aria-label="Clear search"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
};
