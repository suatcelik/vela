import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function fetchJson(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) {
      throw new Error(`${url} -> ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    let symbols: string[] = [];

    try {
      const body = await req.json();
      if (Array.isArray(body?.symbols)) {
        symbols = body.symbols.map((s: string) => s.trim().toUpperCase()).filter(Boolean);
      }
    } catch {
      symbols = [];
    }

    const fx = await fetchJson('https://api.exchangerate-api.com/v4/latest/TRY').catch(() => null);
    const usdRate = fx?.rates?.USD ? 1 / fx.rates.USD : 38.5;

    const crypto = await fetchJson(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,pax-gold&vs_currencies=try'
    ).catch(() => null);

    let yahooPrices: Record<string, number> = {};

    if (symbols.length > 0) {
      const yahooSymbols = symbols.map((symbol) =>
        symbol.length <= 5 && !symbol.includes('.') && !symbol.includes('=') ? `${symbol}.IS` : symbol
      );

      const yfData = await fetchJson(
        `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(yahooSymbols.join(','))}`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36',
          },
        }
      ).catch(() => null);

      if (yfData?.quoteResponse?.result) {
        for (const item of yfData.quoteResponse.result) {
          let price = item?.regularMarketPrice;
          if (typeof price !== 'number') continue;

          if (item.currency === 'USD') {
            price = price * usdRate;
          }

          const originalSymbol = String(item.symbol || '').replace('.IS', '').toUpperCase();
          if (originalSymbol) {
            yahooPrices[originalSymbol] = price;
          }
        }
      }
    }

    const rates = {
      USD: usdRate,
      EUR: fx?.rates?.EUR ? 1 / fx.rates.EUR : 41.5,
      GBP: fx?.rates?.GBP ? 1 / fx.rates.GBP : 49.0,
      XAU: crypto?.['pax-gold']?.try
        ? crypto['pax-gold'].try / 31.1035
        : (2900 / 31.1035) * usdRate,
      BTC: crypto?.bitcoin?.try ?? usdRate * 84000,
      ETH: crypto?.ethereum?.try ?? usdRate * 3200,
      ...yahooPrices,
      updated_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(rates), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
