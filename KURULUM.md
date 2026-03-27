# Vela — Kurulum Rehberi (Faz 1)

## 1. Projeyi Kur

```bash
# Yeni Expo projesi oluştur (TypeScript + Expo Router)
npx create-expo-app vela --template

# Klasörleri ve dosyaları bu repo'dan kopyala
# Ardından bağımlılıkları yükle:
npm install
```

## 2. Supabase Projesi Oluştur

1. [supabase.com](https://supabase.com) → New Project
2. **Project name:** vela  
3. **Region:** eu-central-1 (Frankfurt) — Türkiye'ye en yakın
4. Şifre belirle, oluştur

## 3. Veritabanı Schema'yı Çalıştır

1. Supabase Dashboard → **SQL Editor**
2. `supabase/schema.sql` dosyasının tüm içeriğini yapıştır
3. **Run** — tüm tablolar, RLS politikaları ve trigger oluşur

## 4. API Bilgilerini Al

1. Supabase Dashboard → **Settings → API**
2. **Project URL** ve **anon public** key'i kopyala
3. `.env.local` dosyasına yapıştır:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

## 5. Uygulamayı Çalıştır

```bash
npx expo start --android
# veya
npx expo start --ios
```

## 6. Test Et

1. Register ekranından yeni hesap oluştur
2. E-posta ile giriş yap
3. Dashboard'un açıldığını gör
4. Tab navigator'ın SVG ikonlarla çalıştığını kontrol et

---

## Faz 1 Tamamlandığında Hazır Olanlar ✓

- [x] Supabase Auth (Email/şifre)
- [x] Otomatik profil oluşturma (trigger)
- [x] Row Level Security (her kullanıcı kendi verisini görür)
- [x] Expo Router navigasyon
- [x] Tab navigator (SVG ikonlar, filled/outline aktif/pasif)
- [x] Login + Register ekranları
- [x] Plus Jakarta Sans font sistemi
- [x] Tema sabitleri (renkler, spacing, shadows)
- [x] Reusable Button + Input bileşenleri
- [x] Zustand auth store
- [x] TypeScript type tanımları

## Sonraki Adım: Faz 2 — Borç/Alacak Modülü

- Contact yönetimi (ekle/düzenle)
- Borç/alacak CRUD
- Kısmi ödeme akışı
- Expo Notifications ile vade hatırlatması
