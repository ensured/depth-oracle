import { fetchCandles } from "@/lib/data-fetcher";
import { calculateIndicators } from "@/lib/ta";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const symbol = searchParams.get("symbol") || "ADA-USD";
  const timeframe = searchParams.get("timeframe") || "5m";

  try {
    const candles = await fetchCandles(symbol, timeframe);
    const indicators = calculateIndicators(candles);

    return NextResponse.json({
      candles,
      indicators,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
