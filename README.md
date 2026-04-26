# Lokal

Local business SEO platform. Paste your Google Maps link — get a fully optimized web presence.

## How It Works

1. **Paste Google Maps URL** — extracts business data via Google Places API
2. **Audit** — discovers real competitors via SERP analysis, shows your ranking
3. **Generate** — AI agent researches your market and writes SEO content (streamed via SSE)
4. **Publish** — live at `{your-business}.lokal0.app` with Schema.org + Google Places photos

## Partner Technologies

| Technology | Usage |
|-----------|-------|
| **Pioneer (Fastino)** | GLiNER2 intent classification + auto fine-tuning loop |
| **Google Gemini** | Embedding 2.0 for article similarity (pgvector) |
| **Tavily** | Competitor crawling + agent web search tool |
| **Entire** | Developer platform for agent-human collaboration |

## Key Features

- SERP-based competitor discovery with city-level geo targeting
- Real-time SSE streaming with custom tool UI components
- Claude Sonnet 4.6 agent with adaptive thinking + 3 tools
- Pydantic structured output for article extraction
- Schema.org JSON-LD (Article + LocalBusiness) from Places API data
- Google Places photos injected into published articles
- pgvector similarity search for related articles
- Pioneer fine-tuning loop that improves with every business analyzed
- 24h caching on all DataForSEO calls

## Tech Stack

Next.js 16, Clerk, Drizzle ORM (Neon Postgres + pgvector), TipTap, Tailwind CSS 4, shadcn/ui, AI Elements.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Related Repos

- [content-gen](https://github.com/lokal0/content-gen) — Backend intelligence engine (FastAPI)
- [seo-api](https://github.com/lokal0/seo-api) — DataForSEO proxy (Express/TypeScript)

Built at Big Berlin Hack 2026 by lokal0.
