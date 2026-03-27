export function formatCurrency(amount: number, currency = 'TRY'): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(n: number, decimals = 2): string {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(dateStr));
}

export function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric', month: 'short',
  }).format(new Date(dateStr));
}

export function formatMonthLabel(month: string): string {
  const [y, m] = month.split('-');
  return new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' })
    .format(new Date(Number(y), Number(m) - 1));
}

export function pnlColor(value: number, positiveColor: string, negativeColor: string): string {
  return value >= 0 ? positiveColor : negativeColor;
}

export function initials(name: string): string {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export function pctStr(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}
