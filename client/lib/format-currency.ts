export function formatUsd(
  value: number,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number },
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits:
      options?.maximumFractionDigits ?? options?.minimumFractionDigits ?? 2,
  }).format(value);
}

export function formatUsdCompact(value: number) {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return formatUsd(value);
}

export function formatKrw(value: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);
}
