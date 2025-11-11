"use client";

import * as React from "react";
import * as RadixLabel from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

export interface LabelProps extends RadixLabel.LabelProps {
    required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
    ({ className, children, required = false, ...props }, ref) => {
        return (
            <RadixLabel.Root ref={ref} className={cn("text-sm font-medium", className)} {...props}>
                {children}
                {required && <span className="ml-1 text-destructive" aria-hidden>*</span>}
            </RadixLabel.Root>
        );
    }
);

Label.displayName = "Label";
