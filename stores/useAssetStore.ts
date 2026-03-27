import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Asset, AssetWithValue, ExchangeRates } from '../types';

interface AssetState {
  assets: Asset[];
  rates: ExchangeRates | null;
  loading: boolean;
  ratesLoading: boolean;

  // Hesaplanan Değerler (Computed)
  assetsWithValue: () => AssetWithValue[];
  totalValue: () => number;
  totalCost: () => number;
  totalPnL: () => number;
  totalPnLPercent: () => number;

  // Eylemler (Actions)
  fetchAssets: () => Promise<void>;
  fetchRates: () => Promise<void>;
  addAsset: (data: Omit<Asset, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateAsset: (id: string, data: Partial<Asset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
}

// Varlık tipi -> Kur anahtarı eşleşmesi
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

  // Varlıkların anlık değerlerini, kar/zarar durumlarını hesaplar
  assetsWithValue: () => {
    const { assets, rates } = get();
    
    // Eğer kurlar henüz yüklenmediyse alış fiyatlarını baz alarak döndür
    if (!rates) {
      return assets.map((a) => ({ 
        ...a, 
        current_price: a.buy_price, 
        current_value: a.quantity * a.buy_price, 
        pnl: 0, 
        pnl_percent: 0 
      }));
    }

    return assets.map((a) => {
      let current_price = a.buy_price;
      const key = rateKey[a.type];

      // 1. Sabit Kurlar (Döviz, Altın, Kripto)
      if (key && rates[key]) {
        current_price = rates[key] as number;
      } 
      // 2. Dinamik Semboller (Hisse Senedi, Fon, Emtia)
      // Kullanıcının girdiği sembolü rates objesinde arar (Örn: THYAO, AAPL)
      else if ((rates as any)[a.symbol.toUpperCase()]) {
        current_price = (rates as any)[a.symbol.toUpperCase()];
      }

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

  // Supabase'den varlıkları çeker
  fetchAssets: async () => {
    set({ loading: true });
    const { data } = await supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });
    set({ assets: data ?? [], loading: false });
  },

  // Canlı fiyatları Supabase Edge Function üzerinden çeker
  fetchRates: async () => {
    set({ ratesLoading: true });
    try {
      const activeAssets = get().assets.filter(a => 
        ['stock', 'fund', 'commodity'].includes(a.type)
      );
      const symbols = activeAssets.map(a => a.symbol.toUpperCase());

      // Supabase'e isteği gönder
      const { data, error } = await supabase.functions.invoke('get_exchange_rates', {
        body: { symbols }
      });

      if (error) {
        // Konsolda gerçek hata mesajını görebileceğiz
        console.error("🚨 Supabase Fonksiyon Hatası Detayı:", error);
        throw new Error(`Supabase Hatası: ${error.message || 'Bilinmeyen hata'}`);
      }
      
      if (!data) throw new Error('Fonksiyon çalıştı ancak veri gelmedi');

      set({ rates: data as ExchangeRates, ratesLoading: false });
    } catch (err) {
      console.error("Kur getirme hatası:", err);
      // Hata olsa bile mock verileri yükle ki uygulama tamamen bozulmasın
      set({
        rates: {
          USD: 38.5, EUR: 41.5, GBP: 49.0,
          XAU: 3100, BTC: 3250000, ETH: 125000,
          updated_at: new Date().toISOString(),
        } as any,
        ratesLoading: false,
      });
    }
  },
  // Yeni varlık ekler
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

  // Mevcut varlığı günceller
  updateAsset: async (id, data) => {
    const { data: updated } = await supabase
      .from('assets')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (updated) set((s) => ({ assets: s.assets.map((a) => a.id === id ? updated : a) }));
  },

  // Varlığı siler
  deleteAsset: async (id) => {
    await supabase.from('assets').delete().eq('id', id);
    set((s) => ({ assets: s.assets.filter((a) => a.id !== id) }));
  },
}));