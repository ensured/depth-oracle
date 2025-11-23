import { getAIAnalysis } from "@/lib/groq";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { checkCreditLimit, deductCredits } from "@/lib/token-usage";
import { Candle } from "@/lib/data-fetcher";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate User
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Check Credits (Cost: 0.2)
    const COST = 0.2;
    const {
      canUse,
      remainingCredits,
      error: creditError,
    } = await checkCreditLimit(user.id, COST);

    if (!canUse) {
      return NextResponse.json(
        { error: creditError || "Insufficient credits" },
        { status: 402 }
      );
    }

    // 3. Deduct Credits
    const deduction = await deductCredits(user.id, COST);
    if (!deduction.success) {
      return NextResponse.json(
        { error: "Failed to process credit deduction" },
        { status: 500 }
      );
    }

    const body = await req.json();

    const prompt = `
You are a senior crypto quant trader. Analyze the chart data provided and return a STRICT JSON response.

Symbol: ${body.symbol || "Unknown"}
Timeframe: ${body.timeframe || "5m"}
Latest Price: ${body.price}

Market Context:
Local Support (50 candles): ${
      body.marketContext?.local_support?.toFixed(2) || "N/A"
    }
Local Resistance (50 candles): ${
      body.marketContext?.local_resistance?.toFixed(2) || "N/A"
    }

Trend Indicators:
EMA 9: ${body.indicators?.ema?.ema9?.toFixed(2) || "N/A"}
EMA 21: ${body.indicators?.ema?.ema21?.toFixed(2) || "N/A"}
Trend Context: ${
      body.indicators?.ema?.ema9 && body.indicators?.ema?.ema21
        ? body.indicators.ema.ema9 > body.indicators.ema.ema21
          ? "BULLISH (EMA 9 > EMA 21)"
          : "BEARISH (EMA 9 < EMA 21)"
        : "N/A"
    }

Technical Indicators (Recent):
RSI (14): ${body.indicators?.rsi
      ?.slice(-3)
      .map((r: number) => r?.toFixed(2))
      .join(" → ")}
MACD: ${body.indicators?.macd?.slice(-1)[0]?.MACD?.toFixed(4)}
Bollinger Bands: Upper ${body.indicators?.bb
      ?.slice(-1)[0]
      ?.upper?.toFixed(2)}, Lower ${body.indicators?.bb
      ?.slice(-1)[0]
      ?.lower?.toFixed(2)}

Volume Analysis:
Current Volume: ${body.volume?.current?.toFixed(2) || "N/A"}
Average Volume (20): ${body.volume?.average?.toFixed(2) || "N/A"}
Volume Trend: ${body.volume?.trend || "N/A"}
OBV Trend: ${body.indicators?.obv?.trend || "N/A"} (Current: ${
      body.indicators?.obv?.current?.toFixed(2) || "N/A"
    })
Volume Spike Detected: ${body.marketContext?.volume_spike ? "YES" : "NO"}

Recent Price Action (Last 15 Candles):
${body.recentCandles
  ?.map(
    (c: Candle, i: number) =>
      `[${i + 1}] O:${c.open} H:${c.high} L:${c.low} C:${c.close} V:${c.volume}`
  )
  .join("\n")}

Instructions:
1. **Pattern Recognition**: Identify specific candlestick patterns (e.g., Hammer, Doji, Engulfing) in the last 3-5 candles.
2. **Chart Patterns**: Look for micro-patterns (e.g., Bull Flag, Double Bottom) in the 15-candle sequence.
3. **Support/Resistance**: Compare current price to Local Support/Resistance levels.
4. **Trend Structure**: Analyze if the market is making Higher Highs/Lows or Lower Highs/Lows.
5. **Volume Analysis**: Check for OBV divergence (price vs OBV trend) and significant volume spikes at key levels.
6. **Confluence**: Do patterns align with indicators and volume?

Return a JSON object with this EXACT structure (no markdown, no code blocks, just raw JSON):
{
  "signal": "BULLISH" | "BEARISH" | "NEUTRAL",
  "confidence": number (0-100),
  "reasoning": "Detailed analysis citing specific patterns, support/resistance interactions, indicator confluence, and volume dynamics.",
  "key_levels": {
    "entry_zone": "price range",
    "stop_loss": "price",
    "take_profit": "price"
  },
  "patterns": {
    "candlestick": "Name of pattern detected (e.g., 'Bullish Engulfing') or 'None'",
    "chart_pattern": "Name of chart pattern (e.g., 'Bull Flag') or 'None'",
    "trend": "Description of trend structure (e.g., 'Uptrend with Higher Highs')"
  }
}
`;

    const analysisRaw = await getAIAnalysis(prompt);

    // Clean up potential markdown code blocks if the model adds them
    const jsonString = analysisRaw
      ?.replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let analysis;
    try {
      analysis = JSON.parse(jsonString || "{}");
    } catch {
      console.error("Failed to parse AI JSON:", jsonString);
      // Fallback if JSON parsing fails
      analysis = {
        signal: "NEUTRAL",
        confidence: 0,
        reasoning:
          "AI response could not be parsed. Raw response: " + analysisRaw,
        key_levels: { entry_zone: "N/A", stop_loss: "N/A", take_profit: "N/A" },
      };
    }

    return NextResponse.json({
      analysis,
      creditsRemaining: remainingCredits - COST,
    });
  } catch (error: unknown) {
    console.error("Error in chart analysis:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
