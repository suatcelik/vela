-- Mevcut projede assets.type constraint'i stock/fund/commodity yüzünden hata veriyorsa bunu çalıştır.
alter table public.assets drop constraint if exists assets_type_check;

alter table public.assets
add constraint assets_type_check
check (type in ('gold','usd','eur','gbp','btc','eth','stock','fund','commodity','custom'));
