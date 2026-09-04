export type RevenueGrowthPoint = {
  label: string;
  value: number;
  returnPct: number;
};

export type RevenueGrowthPeriod = "1D" | "1M" | "1Y";

export const REVENUE_PERIOD_TABS: RevenueGrowthPeriod[] = ["1D", "1M", "1Y"];

function buildRevenueSeries(
  points: { label: string; value: number }[],
): RevenueGrowthPoint[] {
  const base = points[0]?.value ?? 1;
  return points.map((p) => ({
    ...p,
    returnPct: Math.round(((p.value - base) / base) * 1000) / 10,
  }));
}

/** Tighter Y scale so intraday / monthly moves read clearly on a small chart */
export function revenueChartDomain([min, max]: [number, number]): [number, number] {
  const span = Math.max(max - min, 1);
  const pad = span * 0.12;
  return [min - pad, max + pad];
}

export function formatRevenueCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

const revenueGrowth1D = buildRevenueSeries([
  { label: "9:30", value: 1_256_100 },
  { label: "9:45", value: 1_257_400 },
  { label: "10:00", value: 1_256_800 },
  { label: "10:15", value: 1_258_900 },
  { label: "10:30", value: 1_257_200 },
  { label: "10:45", value: 1_259_600 },
  { label: "11:00", value: 1_261_300 },
  { label: "11:15", value: 1_260_400 },
  { label: "11:30", value: 1_262_800 },
  { label: "11:45", value: 1_261_900 },
  { label: "12:00", value: 1_263_500 },
  { label: "12:15", value: 1_262_100 },
  { label: "12:30", value: 1_261_400 },
  { label: "12:45", value: 1_262_600 },
  { label: "13:00", value: 1_261_800 },
  { label: "13:15", value: 1_263_200 },
  { label: "13:30", value: 1_264_900 },
  { label: "13:45", value: 1_264_100 },
  { label: "14:00", value: 1_266_400 },
  { label: "14:15", value: 1_265_200 },
  { label: "14:30", value: 1_267_100 },
  { label: "14:45", value: 1_266_300 },
  { label: "15:00", value: 1_267_800 },
  { label: "15:15", value: 1_266_600 },
  { label: "15:30", value: 1_265_400 },
  { label: "15:45", value: 1_264_200 },
  { label: "16:00", value: 1_262_480 },
]);

const revenueGrowth1M = buildRevenueSeries([
  { label: "May 2", value: 1_214_800 },
  { label: "May 4", value: 1_218_200 },
  { label: "May 7", value: 1_216_500 },
  { label: "May 9", value: 1_221_400 },
  { label: "May 12", value: 1_219_600 },
  { label: "May 14", value: 1_225_300 },
  { label: "May 17", value: 1_223_100 },
  { label: "May 19", value: 1_228_700 },
  { label: "May 22", value: 1_226_400 },
  { label: "May 24", value: 1_232_900 },
  { label: "May 27", value: 1_230_200 },
  { label: "May 29", value: 1_236_800 },
  { label: "Jun 1", value: 1_234_500 },
  { label: "Jun 4", value: 1_240_100 },
  { label: "Jun 6", value: 1_237_600 },
  { label: "Jun 9", value: 1_243_800 },
  { label: "Jun 11", value: 1_241_200 },
  { label: "Jun 14", value: 1_247_500 },
  { label: "Jun 16", value: 1_245_900 },
  { label: "Jun 19", value: 1_252_400 },
  { label: "Jun 21", value: 1_250_100 },
  { label: "Jun 24", value: 1_256_700 },
  { label: "Jun 26", value: 1_262_480 },
]);

const revenueGrowth1Y = buildRevenueSeries([
  { label: "Jan", value: 1_128_400 },
  { label: "Jan 15", value: 1_132_800 },
  { label: "Feb", value: 1_130_200 },
  { label: "Feb 15", value: 1_136_500 },
  { label: "Mar", value: 1_134_900 },
  { label: "Mar 15", value: 1_141_200 },
  { label: "Apr", value: 1_138_600 },
  { label: "Apr 15", value: 1_146_800 },
  { label: "May", value: 1_144_300 },
  { label: "May 15", value: 1_152_700 },
  { label: "Jun", value: 1_150_100 },
  { label: "Jun 15", value: 1_158_900 },
  { label: "Jul", value: 1_156_400 },
  { label: "Jul 15", value: 1_164_800 },
  { label: "Aug", value: 1_162_200 },
  { label: "Aug 15", value: 1_171_500 },
  { label: "Sep", value: 1_168_900 },
  { label: "Sep 15", value: 1_177_400 },
  { label: "Oct", value: 1_174_800 },
  { label: "Oct 15", value: 1_184_200 },
  { label: "Nov", value: 1_181_600 },
  { label: "Nov 15", value: 1_224_300 },
  { label: "Dec", value: 1_248_700 },
  { label: "Dec 15", value: 1_262_480 },
]);

export const revenueGrowthByPeriod: Record<
  RevenueGrowthPeriod,
  RevenueGrowthPoint[]
> = {
  "1D": revenueGrowth1D,
  "1M": revenueGrowth1M,
  "1Y": revenueGrowth1Y,
};
