import { Category } from '../types';

export const CATEGORIES: Record<Category, { label: string; icon: string; color: string; bg: string }> = {
  market:    { label: 'Market',    icon: '🛒', color: '#e06000', bg: '#fff3e0' },
  fatura:    { label: 'Fatura',    icon: '⚡', color: '#2d7a4f', bg: '#e8f4e8' },
  ulasim:    { label: 'Ulaşım',   icon: '🚗', color: '#1a4080', bg: '#dce9f7' },
  saglik:    { label: 'Sağlık',   icon: '💊', color: '#c0392b', bg: '#fde8e6' },
  eglence:   { label: 'Eğlence',  icon: '🎮', color: '#6030c0', bg: '#f0e8f8' },
  giyim:     { label: 'Giyim',    icon: '👕', color: '#c06030', bg: '#fff0e8' },
  restoran:  { label: 'Restoran', icon: '🍽️', color: '#c04060', bg: '#fde8ec' },
  egitim:    { label: 'Eğitim',   icon: '📚', color: '#106090', bg: '#e0f0fa' },
  genel:     { label: 'Genel',    icon: '📦', color: '#4a6080', bg: '#f0f4fa' },
  diger:     { label: 'Diğer',   icon: '🔖', color: '#607090', bg: '#f0f4fa' },
};

export const ASSET_LABELS: Record<string, { label: string; icon: string; bg: string }> = {
  gold:   { label: 'Gram Altın',  icon: '🥇', bg: '#fef7d6' },
  usd:    { label: 'Dolar (USD)', icon: '💵', bg: '#e8f4e8' },
  eur:    { label: 'Euro (EUR)',  icon: '💶', bg: '#e8eef8' },
  gbp:    { label: 'Sterlin',    icon: '💷', bg: '#f0e8f0' },
  btc:    { label: 'Bitcoin',    icon: '₿',  bg: '#fff3e0' },
  eth:    { label: 'Ethereum',   icon: '⟠',  bg: '#eee8f8' },
  custom: { label: 'Diğer',      icon: '💎', bg: '#f0f4fa' },
};
