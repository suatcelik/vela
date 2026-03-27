// ─── Auth ───────────────────────────────────────────────
export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  currency: string;
  created_at: string;
}

// ─── Debt / Receivable ──────────────────────────────────
export type DebtType = 'debt' | 'credit'; // debt = I owe, credit = they owe me

export type DebtStatus = 'open' | 'partial' | 'paid';

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Debt {
  id: string;
  user_id: string;
  contact_id: string;
  contact?: Contact;
  type: DebtType;
  amount: number;
  paid_amount: number;
  due_date: string | null;
  description: string | null;
  receipt_url: string | null;
  status: DebtStatus;
  created_at: string;
}

// ─── Assets / Portfolio ─────────────────────────────────
// Yeni varlık türleri (stock, fund, commodity) buraya eklendi
export type AssetType = 'gold' | 'usd' | 'eur' | 'gbp' | 'btc' | 'eth' | 'stock' | 'fund' | 'commodity' | 'custom';

export interface Asset {
  id: string;
  user_id: string;
  type: AssetType;
  symbol: string;
  name: string;
  quantity: number;
  buy_price: number;      // price in TRY when bought
  bought_at: string;
  note: string | null;
  created_at: string;
}

export interface AssetWithValue extends Asset {
  current_price: number;  // live TRY price
  current_value: number;  // quantity * current_price
  pnl: number;            // current_value - (quantity * buy_price)
  pnl_percent: number;
}

export interface ExchangeRates {
  USD: number;
  EUR: number;
  GBP: number;
  XAU: number;  // gold per gram in TRY
  BTC: number;  // BTC in TRY
  ETH: number;
  updated_at: string;
}

// ─── Budget / Transactions ──────────────────────────────
export type TransactionType = 'income' | 'expense';

export type Category =
  | 'market'
  | 'fatura'
  | 'ulasim'
  | 'saglik'
  | 'eglence'
  | 'giyim'
  | 'restoran'
  | 'egitim'
  | 'genel'
  | 'diger';

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  description: string | null;
  date: string;
  receipt_url: string | null;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: Category;
  limit_amount: number;
  month: string; // format: "2026-03"
}

export interface MonthlySummary {
  month: string;
  total_income: number;
  total_expense: number;
  net: number;
  by_category: Record<Category, number>;
}

// ─── UI Helpers ─────────────────────────────────────────
export interface NavTab {
  key: string;
  label: string;
  icon: string;
}