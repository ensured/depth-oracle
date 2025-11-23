// Using Coinbase Pro API to avoid Binance geo-restrictions
// Docs: https://docs.cloud.coinbase.com/exchange/reference/exchangerestapi_getproductcandles

export interface Candle {
  time: number; // Unix timestamp in seconds (Lightweight Charts format)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function fetchCandles(
  symbol: string = "ADA-USD",
  interval: string = "5m"
): Promise<Candle[]> {
  try {
    // Map interval to granularity in seconds
    const granularityMap: { [key: string]: number } = {
      "1m": 60,
      "5m": 300,
      "15m": 900,
      "1h": 3600,
      "6h": 21600,
      "1d": 86400,
    };

    const granularity = granularityMap[interval] || 300;

    const response = await fetch(
      `https://api.exchange.coinbase.com/products/${symbol}/candles?granularity=${granularity}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch candles from Coinbase: ${response.status} ${errorText}`
      );
    }

    const data = await response.json();

    // Coinbase returns [time, low, high, open, close, volume]
    // We need to map it to the format Lightweight Charts expects
    // And Coinbase returns newest first, so we might need to reverse it for the chart
    const candles = data.map((d: number[]) => ({
      time: d[0],
      low: d[1],
      high: d[2],
      open: d[3],
      close: d[4],
      volume: d[5],
    }));

    // Sort by time ascending (oldest first) as required by Lightweight Charts
    return candles.sort((a: Candle, b: Candle) => a.time - b.time);
  } catch (error) {
    console.error("Error fetching candles:", error);
    return [];
  }
}
