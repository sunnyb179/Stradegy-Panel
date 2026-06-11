# Whisp

Whisp is an AI-assisted market analysis MVP for exploring options data, liquidity, volatility, and risk.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- API Route Handlers
- Server-side OpenAI integration with fallback Hermes responses
- Mock market data provider by default

## Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Environment Variables

Create `.env.local` if needed:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
MARKET_DATA_PROVIDER=mock
```

If `OPENAI_API_KEY` is missing, Hermes uses a deterministic fallback response. If `MARKET_DATA_PROVIDER` is unset or unsupported, Whisp uses mock options data.

## MVP Limitations

- Market data is mock data unless a future provider is implemented.
- No login, user profiles, saved watchlists, or saved chat history.
- No brokerage connection, order placement, or real-money execution.
- Hermes provides educational analysis only and does not provide financial, investment, tax, or legal advice.

## Roadmap

- Real market data provider
- Login
- Saved watchlists
- Saved chat history
- Unusual options activity screener
- Earnings calendar
- Volatility rank
- Supabase auth/database
- Python quant backend later
- Agent-based screening workflows later
