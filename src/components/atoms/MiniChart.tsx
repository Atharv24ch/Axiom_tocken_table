"use client";

import React from 'react';

interface MiniChartProps {
    data?: number[];
    width?: number;
    height?: number;
}

export const MiniChart: React.FC<MiniChartProps> = ({ data, width = 50, height = 20 }) => {
    const points = React.useMemo(() => {
        if (!data || data.length === 0) {
            return Array.from({ length: 8 }, (_, index) => 1 - index * 0.01);
        }

        const filtered = data.filter((value) => Number.isFinite(value));
        if (filtered.length < 2) {
            const fallback = filtered[0] ?? 1;
            return [fallback, fallback];
        }

        // Downsample to at most 30 points to keep SVG compact
        const maxPoints = Math.min(30, filtered.length);
        if (filtered.length === maxPoints) {
            return filtered;
        }

        const step = filtered.length / maxPoints;
        const downsampled: number[] = [];
        for (let i = 0; i < maxPoints; i++) {
            const index = Math.floor(i * step);
            downsampled.push(filtered[index]);
        }

        return downsampled;
    }, [data]);

    const first = points[0];
    const last = points[points.length - 1];
    const color = last >= first ? '#10b981' : '#ef4444';

    const maxValue = Math.max(...points);
    const minValue = Math.min(...points);
    const range = maxValue - minValue || 1;

    // Create SVG path
    const pathData = points.map((value, index) => {
        const x = (index / (points.length - 1)) * width;
        const y = height - ((value - minValue) / range) * height;
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    }).join(' ');

    return (
        <svg
            width={width}
            height={height}
            className="inline-block"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
        >
            <path
                d={pathData}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
};
