import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => {
    return twMerge(clsx(inputs));
};

export const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string => {
    return new Intl.NumberFormat("en-US", options).format(value);
};

export const formatPercent = (value: number, fractionDigits = 2): string => {
    const formatter = new Intl.NumberFormat("en-US", {
        style: "percent",
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    });

    return formatter.format(value);
};
