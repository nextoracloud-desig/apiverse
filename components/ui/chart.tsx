"use client";

import { cn } from "@/lib/utils";

interface SimpleLineChartProps {
    data: number[];
    height?: number;
    className?: string;
    color?: string;
}

export function SimpleLineChart({
    data,
    height = 200,
    className,
    color = "currentColor"
}: SimpleLineChartProps) {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;

    // Normalize data to 0-100 range for SVG
    const points = data.map((val, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - ((val - min) / range) * 80 - 10; // 10% padding top/bottom
        return `${x},${y}`;
    }).join(" ");

    return (
        <div className={cn("w-full", className)} style={{ height }}>
            <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="h-full w-full overflow-visible"
            >
                {/* Gradient Definition */}
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Area Path */}
                <path
                    d={`M0,100 ${points} 100,100 Z`}
                    fill="url(#chartGradient)"
                    className="transition-all duration-500 ease-in-out"
                />

                {/* Line Path */}
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    points={points}
                    vectorEffect="non-scaling-stroke"
                    className="transition-all duration-500 ease-in-out"
                />

                {/* Data Points (optional, maybe just on hover in a real app) */}
                {data.map((val, index) => {
                    const x = (index / (data.length - 1)) * 100;
                    const y = 100 - ((val - min) / range) * 80 - 10;
                    return (
                        <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="1.5"
                            fill={color}
                            className="opacity-0 transition-opacity duration-200 hover:opacity-100"
                            vectorEffect="non-scaling-stroke"
                        />
                    );
                })}
            </svg>
        </div>
    );
}
