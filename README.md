# Lokal

Local SEO platform that audits Google Business Profiles, discovers competitors, and generates AI-powered blog content to improve local search rankings.

## How It Works

1. **Paste** your Google Business Profile URL
2. **Audit** scores your profile across reviews, rating, completeness, category, and website
3. **Discover** your top local competitors via SERP analysis
4. **Generate** SEO-optimized blog articles tailored to your niche and location
5. **Publish** articles to your own blog subdomain (e.g., `your-business.blogger.com`)

## Platform

Lokal is three services working together:

| Service        | Stack                     | Purpose                                              |
| -------------- | ------------------------- | ---------------------------------------------------- |
| **lokal0**     | Next.js 16 / Bun / Neon   | Frontend, dashboard, API orchestration, blog engine   |
| **content-gen**| Python / FastAPI           | AI content pipeline: crawl, analyze, cluster, write   |
| **seo-api**    | TypeScript / Express       | DataForSEO wrapper for keyword/SERP/domain data       |

```
Browser → lokal0 → content-gen → seo-api → DataForSEO
```

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) runtime
- [Neon](https://neon.tech) PostgreSQL database (with pgvector)
- [Clerk](https://clerk.com) account for authentication
- [Tavily](https://tavily.com) API key
- [Google Places API](https://developers.google.com/maps/documentation/places/web-service) key
- Running instances of `content-gen` and `seo-api` (or their hosted versions)

### Setup

```bash
# Install dependencies
bun install

# Copy environment template and fill in your keys
cp .env.example .env.local

# Run database migrations
bun run db:migrate

# Seed sample data (optional)
bun run db:seed

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable                  | Purpose                            |
| ------------------------- | ---------------------------------- |
| `DATABASE_URL`            | Neon PostgreSQL connection string   |
| `CLERK_WEBHOOK_SECRET`    | Clerk webhook signature secret      |
| `TAVILY_API_KEY`          | Tavily web extraction API key       |
| `GOOGLE_PLACES_API_KEY`   | Google Places API key               |
| `CONTENT_GEN_URL`         | content-gen backend URL             |
| `CONTENT_GEN_TOKEN`       | Bearer token for content-gen        |
| `BLOG_DOMAIN`             | Blog subdomain base                 |
| `NEXT_PUBLIC_BLOG_DOMAIN` | Client-side blog domain             |

## Scripts

| Command            | Description                  |
| ------------------ | ---------------------------- |
| `bun run dev`      | Start development server      |
| `bun run build`    | Production build              |
| `bun run start`    | Start production server       |
| `bun run lint`     | Run ESLint                    |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:migrate`  | Run database migrations     |
| `bun run db:studio`   | Open Drizzle Studio         |
| `bun run db:seed`     | Seed sample data            |

## Tech Stack

**Frontend (lokal0)**
- Next.js 16 (App Router, React 19) with TypeScript 5 (strict mode)
- Neon serverless PostgreSQL with pgvector for similarity search
- Drizzle ORM for type-safe database access
- Clerk for authentication with webhook-synced user data
- Zod v4 for runtime validation across all external inputs
- Tailwind CSS v4 with shadcn/ui components

**Content Engine (content-gen)**
- Python 3.14 / FastAPI / SQLAlchemy async
- Claude Sonnet 4.6 for agentic content writing
- Gemini Embedding 2 for semantic clustering
- Pioneer AI for keyword intent classification
- Tavily for web crawling, HDBSCAN for topic clustering

**SEO Data (seo-api)**
- TypeScript / Express / Zod 3
- DataForSEO API wrapper with billing transparency
- In-memory cache (24h TTL), stateless

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full system design including the three-service architecture, pipeline stages, database schemas, data flows, API routes, and deployment configuration.

## Deployment

All services deploy via Docker. content-gen and seo-api use Kamal v2 to a Hetzner VPS.

```bash
# lokal0
docker build -t lokal .
docker run -p 3000:3000 --env-file .env.local lokal
```

## License

Private.
