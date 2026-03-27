import { Category } from '../types';

export const CATEGORIES: Record<Category, { label: string; icon: string; color: string; bg: string }> = {
  market:    { label: 'Market',    icon: 'cart-outline', color: '#e06000', bg: '#fff3e0' },
  fatura:    { label: 'Fatura',    icon: 'lightning-bolt-outline', color: '#2d7a4f', bg: '#e8f4e8' },
  ulasim:    { label: 'Ulaşım',    icon: 'car-outline', color: '#1a4080', bg: '#dce9f7' },
  saglik:    { label: 'Sağlık',    icon: 'pill', color: '#c0392b', bg: '#fde8e6' },
  eglence:   { label: 'Eğlence',   icon: 'gamepad-variant-outline', color: '#6030c0', bg: '#f0e8f8' },
  giyim:     { label: 'Giyim',     icon: 'tshirt-crew-outline', color: '#c06030', bg: '#fff0e8' },
  restoran:  { label: 'Restoran',  icon: 'silverware-fork-knife', color: '#c04060', bg: '#fde8ec' },
  egitim:    { label: 'Eğitim',    icon: 'school-outline', color: '#106090', bg: '#e0f0fa' },
  genel:     { label: 'Genel',     icon: 'package-variant-closed', color: '#4a6080', bg: '#f0f4fa' },
  diger:     { label: 'Diğer',     icon: 'bookmark-outline', color: '#607090', bg: '#f0f4fa' },
};

export const ASSET_LABELS: Record<string, { label: string; icon: string; bg: string }> = {
  gold:      { label: 'Gram Altın',  icon: 'gold', bg: '#fef7d6' },
  usd:       { label: 'Dolar (USD)', icon: 'currency-usd', bg: '#e8f4e8' },
  eur:       { label: 'Euro (EUR)',  icon: 'currency-eur', bg: '#e8eef8' },
  gbp:       { label: 'Sterlin',     icon: 'currency-gbp', bg: '#f0e8f0' },
  btc:       { label: 'Bitcoin',     icon: 'bitcoin',  bg: '#fff3e0' },
  eth:       { label: 'Ethereum',    icon: 'ethereum',  bg: '#eee8f8' },
  stock:     { label: 'Hisse Senedi',icon: 'chart-line', bg: '#e0f0fa' },
  fund:      { label: 'Yatırım Fonu',icon: 'briefcase-outline', bg: '#f0e8f8' },
  commodity: { label: 'Emtia',       icon: 'barrel', bg: '#fff0e8' },
  custom:    { label: 'Diğer',       icon: 'diamond-stone', bg: '#f0f4fa' },
};