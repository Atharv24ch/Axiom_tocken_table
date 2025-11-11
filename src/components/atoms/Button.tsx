"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NativeButtonProps = React.ComponentPropsWithoutRef<typeof ShadcnButton>;

export interface ButtonProps extends NativeButtonProps {
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            children,
            isLoading = false,
            leftIcon,
            rightIcon,
            disabled,
            ...props
        },
        ref
    ) => {
        const content = (
            <span className="inline-flex items-center gap-2">
                {leftIcon && <span aria-hidden>{leftIcon}</span>}
                <span className="whitespace-nowrap">{children}</span>
                {rightIcon && <span aria-hidden>{rightIcon}</span>}
            </span>
        );

        return (
            <ShadcnButton
                ref={ref}
                className={cn("data-[loading=true]:pointer-events-none", className)}
                data-loading={isLoading ? "true" : undefined}
                disabled={isLoading || disabled}
                {...props}
            >
                {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        {children}
                    </span>
                ) : (
                    content
                )}
            </ShadcnButton>
        );
    }
);

Button.displayName = "Button";
