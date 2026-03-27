import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Asset, AssetWithValue, ExchangeRates } from '../types';

interface AssetState {
  assets: Asset[];
  rates: ExchangeRates | null;
  loading: boolean;
  ratesLoading: boolean;

  // Computed
  assetsWithValue: () => AssetWithValue[];
  totalValue: () => number;
  totalCost: () => number;
  totalPnL: () => number;
  totalPnLPercent: () => number;

  // Actions
  fetchAssets: () => Promise<void>;
  fetchRates: () => Promise<void>;
  addAsset: (data: Omit<Asset, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateAsset: (id: string, data: Partial<Asset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
}

// Map asset type → rate key
const rateKey: Record<string, keyof ExchangeRates> = {
  gold: 'XAU',
  usd: 'USD',
  eur: 'EUR',
  gbp: 'GBP',
  btc: 'BTC',
  eth: 'ETH',
};

export const useAssetStore = create<AssetState>((set, get) => ({
  assets: [],
  rates: null,
  loading: false,
  ratesLoading: false,

  assetsWithValue: () => {
    const { assets, rates } = get();
    if (!rates) return assets.map((a) => ({ ...a, current_price: a.buy_price, current_value: a.quantity * a.buy_price, pnl: 0, pnl_percent: 0 }));
    return assets.map((a) => {
      const key = rateKey[a.type];
      const current_price = key ? rates[key] : a.buy_price;
      const current_value = a.quantity * current_price;
      const cost = a.quantity * a.buy_price;
      const pnl = current_value - cost;
      const pnl_percent = cost > 0 ? (pnl / cost) * 100 : 0;
      return { ...a, current_price, current_value, pnl, pnl_percent };
    });
  },

  totalValue: () => get().assetsWithValue().reduce((s, a) => s + a.current_value, 0),
  totalCost: () => get().assets.reduce((s, a) => s + a.quantity * a.buy_price, 0),
  totalPnL: () => get().totalValue() - get().totalCost(),
  totalPnLPercent: () => {
    const cost = get().totalCost();
    return cost > 0 ? (get().totalPnL() / cost) * 100 : 0;
  },

  fetchAssets: async () => {
    set({ loading: true });
    const { data } = await supabase.from('assets').select('*').order('created_at', { ascending: false });
    set({ assets: data ?? [], loading: false });
  },

  fetchRates: async () => {
    set({ ratesLoading: true });
    try {
      // CollectAPI altın + ExchangeRate-API döviz + CoinGecko kripto
      // Gerçek projede Supabase Edge Function üzerinden çağır (API key güvenliği için)
      // Burada mock data + gerçek CoinGecko public endpoint kullanıyoruz
      const [fxRes, cryptoRes] = await Promise.all([
        fetch('https://api.exchangerate-api.com/v4/latest/TRY'),
        fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=try'),
      ]);

      const fx = await fxRes.json();
      const crypto = await cryptoRes.json();

      // TRY bazında: 1 TRY kaç birim → ters çevir
      const usdRate = fx.rates?.USD ? 1 / fx.rates.USD : 38.5;
      const eurRate = fx.rates?.EUR ? 1 / fx.rates.EUR : 41.5;
      const gbpRate = fx.rates?.GBP ? 1 / fx.rates.GBP : 49.0;

      const rates: ExchangeRates = {
        USD: usdRate,
        EUR: eurRate,
        GBP: gbpRate,
        XAU: usdRate * 32.15 * 31.1035, // troy oz → gram × USD/TRY (yaklaşık)
        BTC: crypto?.bitcoin?.try ?? usdRate * 84000,
        ETH: crypto?.ethereum?.try ?? usdRate * 3200,
        updated_at: new Date().toISOString(),
      };
      set({ rates, ratesLoading: false });
    } catch {
      // Fallback mock rates
      set({
        rates: {
          USD: 38.5, EUR: 41.5, GBP: 49.0,
          XAU: 7100, BTC: 3250000, ETH: 125000,
          updated_at: new Date().toISOString(),
        },
        ratesLoading: false,
      });
    }
  },

  addAsset: async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: inserted } = await supabase
      .from('assets')
      .insert({ ...data, user_id: user.id })
      .select()
      .single();
    if (inserted) set((s) => ({ assets: [inserted, ...s.assets] }));
  },

  updateAsset: async (id, data) => {
    const { data: updated } = await supabase
      .from('assets').update(data).eq('id', id).select().single();
    if (updated) set((s) => ({ assets: s.assets.map((a) => a.id === id ? updated : a) }));
  },

  deleteAsset: async (id) => {
    await supabase.from('assets').delete().eq('id', id);
    set((s) => ({ assets: s.assets.filter((a) => a.id !== id) }));
  },
}));
