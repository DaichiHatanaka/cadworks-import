/** 金額フォーマット (¥1,234,567) */
export function formatCurrency(value: number): string {
  return `¥${value.toLocaleString("ja-JP")}`;
}

/** 金額を短縮表示 (1.2M, 500K) */
export function formatCurrencyShort(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return `¥${value.toLocaleString("ja-JP")}`;
}

/** 重量フォーマット (kg) */
export function formatWeight(value: number | null): string {
  if (value == null) return "-";
  return `${value.toLocaleString("ja-JP")} kg`;
}

/** 体積フォーマット (m³) */
export function formatVolume(value: number | null): string {
  if (value == null) return "-";
  return `${value.toLocaleString("ja-JP")} m³`;
}

/** 数量フォーマット */
export function formatQuantity(value: number): string {
  return value.toLocaleString("ja-JP");
}
