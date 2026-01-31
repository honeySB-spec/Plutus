"use client";

import { useEffect, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface ApyChartProps {
    poolId: string;
}

export function ApyChart({ poolId }: ApyChartProps) {
    const [data, setData] = useState<{ date: string; apy: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(`https://yields.llama.fi/chart/${poolId}`);
                const json = await res.json();

                if (json.data && Array.isArray(json.data)) {
                    // Take last 30 days or so to show immediate trend
                    const recent = json.data.slice(-30).map((item: any) => ({
                        date: item.timestamp,
                        apy: item.apy
                    }));
                    setData(recent);
                }
            } catch (e) {
                console.error("Failed to fetch chart", e);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [poolId]);

    if (loading) {
        return <div className="h-full w-full bg-slate-100 animate-pulse rounded-md opacity-50" />;
    }

    if (data.length === 0) return <div className="h-[2px] w-full bg-slate-200" />;

    // Determine color based on trend (last APY vs first APY of the period)
    const isUp = data[data.length - 1].apy >= data[0].apy;
    const strokeColor = isUp ? "#10b981" : "#ef4444"; // Emerald or Red
    const fillColor = isUp ? "#d1fae5" : "#fee2e2";

    return (
        <div className="h-12 w-24 md:w-32">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id={`gradient-${poolId}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area
                        type="monotone"
                        dataKey="apy"
                        stroke={strokeColor}
                        strokeWidth={2}
                        fill={`url(#gradient-${poolId})`}
                        isAnimationActive={false} // Performance optimization for many charts
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
