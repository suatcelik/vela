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

  const fallbackRates = {
    USD: 38.5,
    EUR: 41.5,
    GBP: 49.0,
    XAU: 3100,
    BTC: 3250000,
    ETH: 125000,
    updated_at: new Date().toISOString(),
  };

  try {
    let symbols: string[] = [];

    try {
      const body = await req.json();

      if (Array.isArray(body?.symbols)) {
        symbols = body.symbols
          .filter((s: unknown) => typeof s === 'string')
          .map((s: string) => s.trim().toUpperCase())
          .filter(Boolean);
      }
    } catch (parseError) {
      console.log('Body parse error:', parseError);
      symbols = [];
    }

    let fx: any = null;
    let crypto: any = null;
    let yahooPrices: Record<string, number> = {};

    try {
      fx = await fetchJson('https://api.exchangerate-api.com/v4/latest/TRY');
    } catch (e) {
      console.log('FX fetch failed:', e);
    }

    const usdRate = fx?.rates?.USD ? 1 / fx.rates.USD : fallbackRates.USD;
    const eurRate = fx?.rates?.EUR ? 1 / fx.rates.EUR : fallbackRates.EUR;
    const gbpRate = fx?.rates?.GBP ? 1 / fx.rates.GBP : fallbackRates.GBP;

    try {
      crypto = await fetchJson(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,pax-gold&vs_currencies=try'
      );
    } catch (e) {
      console.log('Crypto fetch failed:', e);
    }

    if (symbols.length > 0) {
      try {
        const yahooSymbols = symbols.map((symbol) =>
          symbol.length <= 5 && !symbol.includes('.') && !symbol.includes('=')
            ? `${symbol}.IS`
            : symbol
        );

        const yfData = await fetchJson(
          `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(
            yahooSymbols.join(',')
          )}`,
          {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36',
            },
          }
        );

        if (yfData?.quoteResponse?.result) {
          for (const item of yfData.quoteResponse.result) {
            let price = item?.regularMarketPrice;
            if (typeof price !== 'number') continue;

            if (item.currency === 'USD') {
              price = price * usdRate;
            }

            const originalSymbol = String(item.symbol || '')
              .replace('.IS', '')
              .toUpperCase();

            if (originalSymbol) {
              yahooPrices[originalSymbol] = price;
            }
          }
        }
      } catch (e) {
        console.log('Yahoo fetch failed:', e);
      }
    }

    const rates = {
      USD: usdRate,
      EUR: eurRate,
      GBP: gbpRate,
      XAU: crypto?.['pax-gold']?.try
        ? crypto['pax-gold'].try / 31.1035
        : fallbackRates.XAU,
      BTC: crypto?.bitcoin?.try ?? fallbackRates.BTC,
      ETH: crypto?.ethereum?.try ?? fallbackRates.ETH,
      ...yahooPrices,
      updated_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(rates), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.log('Edge function fatal error:', error);

    return new Response(
      JSON.stringify({
        ...fallbackRates,
        debug_error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});