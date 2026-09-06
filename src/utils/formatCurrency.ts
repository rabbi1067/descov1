/**
 * Formats a number as Bangladeshi Taka (৳)
 */
export function formatCurrency(amount: number | string | undefined | null, includeDecimals = false): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '৳0';
  }
  const numeric = Number(amount);
  const formatted = new Intl.NumberFormat('en-BD', {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(numeric);

  return `৳${formatted}`;
}

export function formatTaka(amount: number | string | undefined | null): string {
  return formatCurrency(amount);
}
