import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textVariants = cva("text-foreground", {
    variants: {
        size: {
            xs: "text-xs leading-4",
            sm: "text-sm leading-5",
            md: "text-base leading-6",
            lg: "text-lg leading-7",
            xl: "text-xl leading-8",
        },
        weight: {
            regular: "font-normal",
            medium: "font-medium",
            semibold: "font-semibold",
            bold: "font-bold",
        },
        tone: {
            default: "text-foreground",
            muted: "text-muted-foreground",
            success: "text-emerald-500",
            danger: "text-destructive",
            warning: "text-amber-500",
        },
        truncate: {
            true: "truncate",
        },
        uppercase: {
            true: "uppercase tracking-wide",
        },
    },
    defaultVariants: {
        size: "md",
        weight: "regular",
        tone: "default",
    },
});

export interface TextProps
    extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
    as?: "p" | "span" | "div";
}

export const Text = ({
    as: Component = "p",
    size,
    weight,
    tone,
    truncate,
    uppercase,
    className,
    ...props
}: TextProps) => {
    return (
        <Component
            className={cn(textVariants({ size, weight, tone, truncate, uppercase }), className)}
            {...props}
        />
    );
};
