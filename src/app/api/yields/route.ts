import { NextResponse } from 'next/server';
import { getGlobalMarketData } from '@/lib/aggregator';

export async function GET() {
    try {
        const marketData = await getGlobalMarketData();
        return NextResponse.json(marketData);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}