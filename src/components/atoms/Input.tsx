"use client";

import * as React from "react";
import { Input as ShadcnInput } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentPropsWithoutRef<typeof ShadcnInput> {
    error?: string;
    startAddon?: React.ReactNode;
    endAddon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ error, startAddon, endAddon, className, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1">
                <div className="flex items-center rounded-md border border-input bg-background text-sm focus-within:ring-2 focus-within:ring-ring">
                    {startAddon && (
                        <span className="px-3 text-muted-foreground" aria-hidden>
                            {startAddon}
                        </span>
                    )}
                    <ShadcnInput
                        ref={ref}
                        className={cn(
                            "flex-1 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
                            startAddon && "pl-0",
                            endAddon && "pr-0",
                            className
                        )}
                        {...props}
                    />
                    {endAddon && (
                        <span className="px-3 text-muted-foreground" aria-hidden>
                            {endAddon}
                        </span>
                    )}
                </div>
                {error && <span className="text-xs text-destructive">{error}</span>}
            </div>
        );
    }
);

Input.displayName = "Input";
