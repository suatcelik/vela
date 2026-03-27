import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // 1. Gelen sembolleri güvenli oku
    let symbols: string[] = [];
    try {
      const body = await req.json();
      symbols = body.symbols || [];
    } catch (e) { symbols = []; }

    // 2. Döviz Kurları
    const fxRes = await fetch('https://api.exchangerate-api.com/v4/latest/TRY');
    const fx = fxRes.ok ? await fxRes.json() : null;
    const usdRate = fx?.rates?.USD ? 1 / fx.rates.USD : 38.5;

    // 3. Kripto ve Altın (PAX Gold)
    // PAXG, 1 Ons Altına eşittir.
    const cryptoRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,pax-gold&vs_currencies=try');
    const crypto = cryptoRes.ok ? await cryptoRes.json() : null;

    // 4. Yahoo Finance (Hisse ve Emtia)
    let yahooPrices: Record<string, number> = {};
    if (symbols.length > 0) {
      const yahooSymbols = symbols.map((s: string) => 
        (s.length <= 5 && !s.includes('.') && !s.includes('=')) ? `${s}.IS` : s
      );

      // Yahoo Finance için User-Agent şarttır!
      const yfRes = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${yahooSymbols.join(',')}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
      });
      
      if (yfRes.ok) {
        const yfData = await yfRes.ok ? await yfRes.json() : null;
        if (yfData?.quoteResponse?.result) {
          yfData.quoteResponse.result.forEach((res: any) => {
            let price = res.regularMarketPrice;
            // USD bazlı hisseleri TRY'ye çevir
            if (res.currency === 'USD') price = price * usdRate; 
            const originalSymbol = res.symbol.replace('.IS', '').toUpperCase();
            yahooPrices[originalSymbol] = price;
          });
        }
      }
    }

    const rates = {
      USD: usdRate,
      EUR: fx?.rates?.EUR ? 1 / fx.rates.EUR : 41.5,
      GBP: fx?.rates?.GBP ? 1 / fx.rates.GBP : 49.0,
      XAU: crypto?.['pax-gold']?.try ? crypto['pax-gold'].try / 31.1035 : (2900 / 31.1035) * usdRate,
      BTC: crypto?.bitcoin?.try ?? usdRate * 84000,
      ETH: crypto?.ethereum?.try ?? usdRate * 3200,
      ...yahooPrices,
      updated_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(rates), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})