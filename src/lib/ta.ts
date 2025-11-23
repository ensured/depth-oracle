import {
  RSI,
  EMA,
  MACD,
  BollingerBands,
  Stochastic,
  ATR,
} from "technicalindicators";

interface Candle {
  close: number;
  high: number;
  low: number;
}

export function calculateIndicators(candles: Candle[]) {
  const close = candles.map((c) => c.close);
  const high = candles.map((c) => c.high);
  const low = candles.map((c) => c.low);
  // const volume = candles.map(c => c.volume); // Unused for now

  return {
    rsi: RSI.calculate({ values: close, period: 14 }),
    ema20: EMA.calculate({ values: close, period: 20 }),
    ema50: EMA.calculate({ values: close, period: 50 }),
    macd: MACD.calculate({
      values: close,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    }),
    bb: BollingerBands.calculate({
      values: close,
      period: 20,
      stdDev: 2,
    }),
    stochastic: Stochastic.calculate({
      high,
      low,
      close,
      period: 14,
      signalPeriod: 3,
    }),
    atr: ATR.calculate({
      high,
      low,
      close,
      period: 14,
    }),
  };
}
