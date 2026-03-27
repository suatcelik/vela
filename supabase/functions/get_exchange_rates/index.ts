import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Döviz kurlarını çek
    let fx = null;
    try {
      const fxRes = await fetch('https://api.exchangerate-api.com/v4/latest/TRY');
      if (fxRes.ok) fx = await fxRes.json();
    } catch (err) {
      console.error("Döviz API hatası:", err);
    }

    // 2. Kripto kurlarını çek (CoinGecko bulut sunucuları bazen engeller!)
    let crypto = null;
    try {
      const cryptoRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=try');
      if (cryptoRes.ok) crypto = await cryptoRes.json();
    } catch (err) {
      console.error("Kripto API hatası:", err);
    }

    // API'ler engellese bile fonksiyonun çökmemesi için varsayılan değerler
    const usdRate = fx?.rates?.USD ? 1 / fx.rates.USD : 38.5;
    const eurRate = fx?.rates?.EUR ? 1 / fx.rates.EUR : 41.5;
    const gbpRate = fx?.rates?.GBP ? 1 / fx.rates.GBP : 49.0;

    const rates = {
      USD: usdRate,
      EUR: eurRate,
      GBP: gbpRate,
      XAU: usdRate * 32.15 * 31.1035, 
      BTC: crypto?.bitcoin?.try ?? usdRate * 84000,
      ETH: crypto?.ethereum?.try ?? usdRate * 3200,
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