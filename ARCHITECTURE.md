# Architecture

System architecture reference for the Lokal platform.

## What Lokal Does

Lokal helps local businesses rank higher on Google. A business owner pastes their Google Business Profile URL and the platform:

1. **Audits** their profile across five categories (reviews, rating, completeness, category, website)
2. **Discovers** local competitors via SERP analysis
3. **Generates** AI-powered blog articles optimized for their niche and location
4. **Publishes** those articles to a multi-tenant blog subdomain to improve local search rankings

## Platform Overview

Lokal is a three-service architecture. The frontend orchestrates two backend services that handle SEO data and AI content generation.

```
┌──────────────────────────────────────────────────────────────────┐
│                          User Browser                            │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│  lokal0 (Next.js 16 / Bun)                                      │
│  Frontend + API routes + multi-tenant blog                       │
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ Dashboard    │  │ Blog Engine  │  │ API Routes             │  │
│  │ - Audit      │  │ - Tenant     │  │ - /api/rank-better     │  │
│  │ - Generating │  │   routing    │  │ - /api/stream/[jobId]  │  │
│  │ - Results    │  │ - Article    │  │ - /api/photos          │  │
│  │ - Articles   │  │   rendering  │  │ - /api/webhooks/clerk  │  │
│  └─────────────┘  └──────────────┘  └───────────┬────────────┘  │
│                                                  │               │
│  ┌──────────────┐  ┌──────────────┐              │               │
│  │ Clerk Auth   │  │ Neon DB      │              │               │
│  │ (middleware)  │  │ + pgvector   │              │               │
│  └──────────────┘  └──────────────┘              │               │
└──────────────────────────────────────────────────┼───────────────┘
                                                   │
                          ┌────────────────────────┤
                          │                        │
                          ▼                        ▼
┌─────────────────────────────────┐  ┌─────────────────────────────┐
│  content-gen (Python / FastAPI) │  │  seo-api (TypeScript/Express)│
│  AI content generation engine   │  │  DataForSEO API wrapper      │
│                                 │  │                              │
│  Pipeline stages:               │──│  Endpoints:                  │
│  1. Geo resolution              │  │  - /keywords/research        │
│  2. Competitor discovery        │  │  - /keywords/overview        │
│  3. Web crawling (Tavily)       │  │  - /keywords/serp            │
│  4. SEO data (via seo-api) ─────│──│  - /domain/overview          │
│  5. Keyword extraction          │  │  - /domain/suggestions       │
│  6. Keyword enrichment          │  │  - /backlinks/overview       │
│  7. Intent classification       │  │  - /backlinks/referring-     │
│  8. Embedding + clustering      │  │    domains                   │
│  9. Content agent (Claude)      │  │  - /backlinks/top-pages      │
│ 10. Persistence                 │  │  - /locations                │
│                                 │  │                              │
│  ┌──────────┐  ┌─────────────┐  │  │  ┌──────────────────┐       │
│  │ PostgreSQL│  │ Claude 4.6  │  │  │  │ DataForSEO API   │       │
│  │ (state)   │  │ Gemini Emb. │  │  │  │ (upstream)       │       │
│  │           │  │ Pioneer AI  │  │  │  └──────────────────┘       │
│  └──────────┘  └─────────────┘  │  │                              │
└─────────────────────────────────┘  └─────────────────────────────┘
```

## Services

### lokal0 - Frontend & Orchestrator

| Property   | Value                                                 |
| ---------- | ----------------------------------------------------- |
| Language   | TypeScript 5 (strict mode, zero `any` references)     |
| Framework  | Next.js 16 (App Router, React 19)                     |
| Runtime    | Bun                                                   |
| Database   | Neon (serverless PostgreSQL) + pgvector                |
| ORM        | Drizzle ORM with `drizzle-kit` migrations              |
| Auth       | Clerk (webhook sync via Svix)                          |
| Validation | Zod v4                                                 |
| Styling    | Tailwind CSS v4, shadcn/ui, Radix primitives           |
| Deployment | Docker (multi-stage Bun build, standalone output)      |

The frontend handles user-facing UI, authentication, profile persistence, blog rendering, and orchestrates calls to the two backends.

### content-gen - AI Content Engine

| Property     | Value                                                    |
| ------------ | -------------------------------------------------------- |
| Language     | Python 3.14                                               |
| Framework    | FastAPI + Uvicorn                                         |
| Database     | PostgreSQL 16 (SQLAlchemy async, asyncpg)                 |
| AI - Writing | Anthropic Claude Sonnet 4.6 (agentic loop with tools)    |
| AI - Embeddings | Google Gemini (`gemini-embedding-2`, 768 dims)         |
| AI - Intent  | Pioneer AI (fine-tuned `gliner2-base-v1`)                 |
| Web Crawling | Tavily (up to 20 pages, depth 3 per competitor)           |
| SEO Data     | DataForSEO (via seo-api)                                  |
| NLP          | scikit-learn (TF-IDF), rake-nltk (RAKE), HDBSCAN          |
| Deployment   | Docker + Kamal v2, Hetzner VPS                            |

The content generation pipeline runs as a background task after receiving an analyze request. It crawls competitors, extracts and enriches keywords, clusters them by topic, then uses an agentic Claude loop to research and write full SEO articles.

### seo-api - SEO Data Proxy

| Property   | Value                                                  |
| ---------- | ------------------------------------------------------ |
| Language   | TypeScript 5 (strict, ESM)                              |
| Framework  | Express 4                                               |
| Validation | Zod 3                                                   |
| Upstream   | DataForSEO API                                          |
| State      | Stateless (in-memory cache, 24h TTL)                    |
| Deployment | Docker + Kamal, same Hetzner VPS                        |

A clean wrapper around DataForSEO that normalizes inputs, validates with Zod, provides billing transparency, and exposes keyword research, SERP analysis, domain overview, and backlink data as simple JSON endpoints. Consumed exclusively by content-gen.

## Service Communication

```
lokal0 ──POST /api/v1/analyze──────────────► content-gen
lokal0 ──GET  /api/v1/analyze/{id}/stream──► content-gen  (SSE proxy)
lokal0 ──GET  /api/v1/analyze/{id}─────────► content-gen  (poll status)
lokal0 ──POST /api/v1/discover-competitors─► content-gen  (audit flow)

content-gen ──POST /keywords/research──────► seo-api
content-gen ──POST /keywords/overview──────► seo-api
content-gen ──POST /keywords/serp──────────► seo-api
content-gen ──POST /domain/overview────────► seo-api
content-gen ──POST /domain/suggestions─────► seo-api
content-gen ──GET  /locations──────────────► seo-api

seo-api ───────────────────────────────────► DataForSEO API
```

Authentication between services uses Bearer tokens. `lokal0 → content-gen` uses `CONTENT_GEN_TOKEN`. `content-gen → seo-api` uses `SEO_API_TOKEN`.

## content-gen Pipeline

When `POST /api/v1/analyze` is called, the pipeline runs these stages as a background task with real-time SSE progress:

### 1. Geo Resolution

Resolves `business_location` to a DataForSEO `location_code` + `language_code` via `seo-api /locations`. Falls back to country-level codes.

### 2. Competitor Discovery

If no competitor URLs are provided, generates seed keywords from business name/category/location, queries SERP via seo-api, filters out platforms (Yelp, TripAdvisor, etc.) and directories, returns top 5 domains by SERP rank.

### 3. Web Crawling

Uses Tavily to crawl each competitor (up to 20 pages, depth 3). Extracts titles, full text, headings (H1-H6), page metadata, and raw markdown. All competitors crawled in parallel.

### 4. SEO Data Gathering

In parallel with crawling, fetches domain overviews from seo-api: organic traffic, organic keywords, top pages, ranked keywords.

### 5. Keyword Extraction

Two methods per competitor:
- **TF-IDF** (scikit-learn): ngrams 1-3, top 30 keywords per competitor
- **RAKE** (rake-nltk): multi-word phrases 2-4 words, top 30

### 6. Keyword Enrichment

Top 50 keywords sent to `seo-api /keywords/overview` for search volume, CPC, competition, keyword difficulty, and intent data. Batches of 700.

### 7. Intent Classification

Pioneer AI classifies each keyword as `informational`, `transactional`, `navigational`, or `commercial`. Intent weights: transactional=1.5, commercial=1.3, informational=1.0, navigational=0.5. Supports fine-tuned models trained on DataForSEO ground truth.

### 8. Embedding + Clustering

- Gemini Embedding 2 embeds all keywords (768-dim, batches of 100)
- HDBSCAN clusters the embeddings (min_cluster_size=3, min_samples=2)
- Clusters scored by: `volume × gap_factor × difficulty_factor × intent_weight × novelty_factor`

### 9. Content Agent

An agentic loop using Claude Sonnet 4.6 with three tools:

| Tool             | Purpose                                   | Budget |
| ---------------- | ----------------------------------------- | ------ |
| `keyword_serp`   | Analyze current SERP for a keyword        | Max 5  |
| `keyword_research`| Discover related keywords                | Max 2  |
| `tavily_search`  | Web search for current information         | Max 2  |

The agent receives business context, competitor overview, and top 15 topic clusters ranked by opportunity. It researches and writes full SEO articles for the top 3-5 clusters including meta titles, heading hierarchy, and competitive angles. Max 15 iterations.

After writing, a second Claude call extracts structured articles from the raw markdown with Pydantic validation. Each article gets a Gemini embedding for similarity search on the frontend.

### 10. Persistence

Results saved to content-gen's PostgreSQL: submission marked completed with full `result_json`, competitor records, crawled pages, extracted keywords, and intent training samples.

## seo-api Endpoints

All endpoints are `POST` with JSON body/response unless noted. Bearer token auth when `API_BEARER_TOKEN` is set.

| Endpoint                       | Method | Purpose                                              |
| ------------------------------ | ------ | ---------------------------------------------------- |
| `/keywords/research`           | POST   | Keyword discovery (auto-fallback: related → suggestions → ideas) |
| `/keywords/overview`           | POST   | Bulk keyword metrics (volume, CPC, difficulty, intent) |
| `/keywords/serp`               | POST   | SERP analysis for a keyword                           |
| `/domain/overview`             | POST   | Domain organic traffic, keywords, top pages           |
| `/domain/suggestions`          | POST   | Keyword suggestions from ranked keywords              |
| `/backlinks/overview`          | POST   | Backlink summary + history                            |
| `/backlinks/referring-domains` | POST   | Referring domains list                                |
| `/backlinks/top-pages`         | POST   | Top pages by backlink count                           |
| `/locations`                   | GET    | DataForSEO location code lookup                       |
| `/health`                      | GET    | Liveness check                                        |

Every response includes a `billing` field with `{ path, costUsd, resultCount }` for DataForSEO spend tracking.

## content-gen Database Schema

Five tables in PostgreSQL, auto-created on startup.

### `submissions`

Job state tracking. One per analyze request.

| Column      | Type | Notes                                    |
| ----------- | ---- | ---------------------------------------- |
| id          | UUID | PK                                       |
| status      | text | pending / processing / completed / failed |
| error       | text | Error message if failed                   |
| progress    | JSON | Stage progress for SSE hydration          |
| result_json | JSON | Full pipeline output when completed       |
| created_at  | timestamp |                                       |

### `competitors`

| Column        | Type | Notes                      |
| ------------- | ---- | -------------------------- |
| id            | UUID | PK                         |
| submission_id | UUID | FK → submissions           |
| url           | text | Competitor URL              |

### `crawled_pages`

| Column        | Type | Notes                         |
| ------------- | ---- | ----------------------------- |
| id            | UUID | PK                            |
| competitor_id | UUID | FK → competitors              |
| url           | text | Crawled page URL               |
| title         | text | Page title                     |
| full_text     | text | Extracted plain text           |
| headings      | JSON | H1-H6 hierarchy               |
| page_metadata | JSON | Meta tags, OG data             |
| schema_org    | JSON | Structured data from page      |
| raw_content   | JSON | Raw markdown (capped 50k)      |

### `keywords`

| Column        | Type  | Notes                        |
| ------------- | ----- | ---------------------------- |
| id            | UUID  | PK                           |
| competitor_id | UUID  | FK → competitors             |
| keyword       | text  | Extracted keyword             |
| score         | float | Relevance score               |
| method        | text  | tfidf / rake                  |

### `intent_training_samples`

Ground truth for Pioneer AI fine-tuning.

| Column  | Type | Notes                                           |
| ------- | ---- | ----------------------------------------------- |
| id      | UUID | PK                                              |
| keyword | text |                                                 |
| intent  | text | informational / transactional / navigational / commercial |
| source  | text | dataforseo                                      |

## lokal0 Directory Structure

```
lokal0/
├── app/                         # Next.js App Router
│   ├── (marketing)/             # Landing page (public)
│   ├── (auth)/                  # Sign-in / sign-up (Clerk redirect)
│   ├── (dashboard)/             # Authenticated dashboard
│   │   └── dashboard/
│   │       ├── audit/           # Profile audit (form + [url] results)
│   │       │   └── [url]/      # Audit results with caching + after() persistence
│   │       ├── articles/        # Article list + individual preview
│   │       ├── generating/      # Real-time SSE generation progress
│   │       └── results/[jobId]/ # Completed job results
│   ├── (blog)/                  # Multi-tenant public blog
│   │   └── blog/[tenant]/       # Tenant index + article pages
│   └── api/                     # API routes
│       ├── rank-better/         # Content generation trigger + polling
│       ├── stream/[jobId]/      # SSE proxy to content-gen
│       ├── photos/              # Google Places photo proxy
│       └── webhooks/clerk/      # Clerk webhook handler
├── components/
│   ├── ui/                      # ~40 shadcn/ui primitives
│   ├── landing/                 # Marketing page components
│   ├── audit/                   # AuditView, score ring, category bars, competitor table
│   ├── blog/                    # TipTap article renderer
│   ├── generating/              # SSE event feed + tool call renderers
│   ├── ai-elements/             # AI chat UI primitives
│   └── dashboard/               # Dashboard-specific components
├── db/
│   ├── schema.ts                # Drizzle schema (5 tables)
│   ├── index.ts                 # Lazy-singleton DB connection
│   ├── migrate.ts               # Migration runner
│   ├── seed.ts                  # Sample data seeder
│   └── migrations/              # SQL migration files
├── domains/                     # Domain types, validation, constants
│   ├── article/                 # BlogArticle, ContentJob, TopicCluster
│   ├── audit/                   # ProfileAudit, AuditCategory, Competitor, scoring
│   ├── profile/                 # GoogleBusinessProfile, GBP URL validation
│   └── user/                    # User type, Clerk webhook schema
├── services/                    # Server-side business logic
│   ├── audit-service.ts         # getOrCreateAudit (cached) + computeAudit (fresh)
│   ├── audit-persistence.ts     # persistAuditResult (profile upsert + audit save)
│   ├── tavily-service.ts        # Business info extraction + competitor discovery
│   ├── article-service.ts       # Article + content job CRUD
│   ├── profile-service.ts       # Profile + audit persistence
│   └── user-service.ts          # Current user resolution
├── hooks/                       # Client-side React hooks
│   ├── use-event-stream.ts      # SSE EventSource hook
│   └── use-mobile.ts            # Responsive breakpoint detection
├── lib/                         # Shared utilities
│   ├── auth.ts                  # Clerk auth guards
│   ├── blog-url.ts              # Blog URL construction
│   ├── markdown.ts              # Markdown-to-HTML conversion
│   └── utils.ts                 # cn() (clsx + tailwind-merge)
├── middleware.ts                 # Clerk auth + subdomain blog routing
├── Dockerfile                   # Multi-stage production build
└── drizzle.config.ts            # Drizzle Kit configuration
```

## lokal0 Database Schema

Five tables in Neon PostgreSQL with pgvector extension enabled.

### `users`

Synced from Clerk via webhooks. Local copy for foreign key relationships.

| Column     | Type      | Notes                    |
| ---------- | --------- | ------------------------ |
| id         | uuid (PK) | Auto-generated           |
| clerk_id   | text      | Unique, links to Clerk   |
| email      | text      | Required                 |
| name       | text      | Nullable                 |
| image_url  | text      | Nullable                 |
| created_at | timestamp | Auto-set                 |
| updated_at | timestamp | Auto-set                 |

### `profiles`

Google Business Profiles being tracked.

| Column          | Type      | Notes                          |
| --------------- | --------- | ------------------------------ |
| id              | uuid (PK) |                                |
| user_id         | uuid (FK) | References `users.id`          |
| url             | text      | GBP URL                        |
| name            | text      | Extracted business name         |
| category        | text      | Business category               |
| location        | text      | Business location               |
| place_id        | text      | Google Places ID                |
| rating          | integer   | Stored as rating x 10           |
| review_count    | integer   |                                |
| tenant_slug     | text      | Unique subdomain identifier     |
| competitor_urls | jsonb     | Array of competitor URLs        |
| photo_refs      | jsonb     | Google Places photo references  |
| status          | enum      | pending / active / error        |

### `audits`

Point-in-time audit snapshots.

| Column        | Type      | Notes                                      |
| ------------- | --------- | ------------------------------------------ |
| id            | uuid (PK) |                                            |
| profile_id    | uuid (FK) | References `profiles.id`                   |
| overall_score | integer   | 0-100                                      |
| categories    | jsonb     | `{name, score, maxScore, suggestions}[]`   |
| competitors   | jsonb     | Competitor data array                       |

### `content_jobs`

AI content generation job tracking.

| Column              | Type      | Notes                              |
| ------------------- | --------- | ---------------------------------- |
| id                  | uuid (PK) |                                    |
| job_id              | text      | External backend job ID (unique)   |
| tenant_slug         | text      | Target blog tenant                  |
| business_*          | text      | Name, category, location context    |
| competitors         | jsonb     | Competitor analysis results         |
| topic_clusters      | jsonb     | Keyword cluster data                |
| agent_tool_calls    | jsonb     | AI agent tool call log              |
| agent_*_tokens      | integer   | Input/output token usage            |
| status              | enum      | processing / completed / failed     |

### `articles`

Generated blog articles with pgvector embeddings for similarity search.

| Column            | Type      | Notes                                    |
| ----------------- | --------- | ---------------------------------------- |
| id                | uuid (PK) |                                          |
| job_id            | text      | Source content job                        |
| content_job_id    | uuid (FK) | References `content_jobs.id`              |
| profile_id        | uuid (FK) | References `profiles.id`                  |
| tenant_slug       | text      | Blog tenant                               |
| slug              | text      | URL slug (unique per tenant)              |
| title             | text      |                                           |
| markdown_content  | text      | Full article body                         |
| cluster_keywords  | jsonb     | Target keywords                           |
| search_volume     | integer   | SEO metric                                |
| keyword_difficulty| integer   | SEO metric                                |
| schema_jsonld     | jsonb     | Schema.org structured data                |
| status            | enum      | draft / generating / published / failed   |
| published_at      | timestamp |                                           |

Unique constraint: `(tenant_slug, slug)`.

## Core Data Flows

### Audit Flow

```
User pastes GBP URL
  → /dashboard/audit/[url]
  → getOrCreateAudit()
    → Check DB for cached audit (24h TTL)
    → Cache miss → computeAudit()
      → extractBusinessInfo()       [Google Places API or Tavily]
      → searchCompetitors()         [content-gen /api/v1/discover-competitors]
        → content-gen queries seo-api for SERP data
        → filters platforms, ranks by SERP position
      → scoreAudit()                [pure scoring rules in domains/audit/scoring.ts]
      → rankCompetitors()           [pure ranking functions]
  → Render: AuditView (ScoreRing + CategoryBars + CompetitorTable)
  → after(): persistAuditResult()
    → findOrCreateProfile()         [upsert to lokal0 DB]
    → saveAudit()                   [persist audit snapshot]
```

### Content Generation Flow

```
User clicks "Rank Better"
  → POST /api/rank-better (lokal0)
    → Validate with rankBetterRequestSchema (Zod)
    → POST content-gen /api/v1/analyze
      → content-gen runs pipeline as background task:
        1. Geo resolution ──────────────► seo-api /locations
        2. Competitor discovery ────────► seo-api /keywords/serp
        3. Crawling ────────────────────► Tavily
        4. SEO data ────────────────────► seo-api /domain/overview
        5. Keyword extraction ──────────► TF-IDF + RAKE (local)
        6. Keyword enrichment ──────────► seo-api /keywords/overview
        7. Intent classification ───────► Pioneer AI
        8. Embedding + clustering ──────► Gemini + HDBSCAN (local)
        9. Content agent ───────────────► Claude 4.6 (with tools)
           └─ keyword_serp ────────────► seo-api /keywords/serp
           └─ keyword_research ────────► seo-api /keywords/research
           └─ tavily_search ───────────► Tavily
       10. Persist results ────────────► content-gen PostgreSQL
    → createContentJob() in lokal0 DB
    → Return jobId

  → Navigate to /dashboard/generating?jobId=...
  → useEventStream() opens SSE via /api/stream/[jobId]
    → Proxied from content-gen /api/v1/analyze/{id}/stream
    → Events: stage, tool_call, thinking, text, article, complete

  → On complete: GET /api/rank-better/[jobId]
    → Fetch full results from content-gen
    → completeContentJob() with metadata
    → createArticle() for each article (validated with backendArticleSchema)
    → Store pgvector embeddings for similarity search
  → Redirect to /dashboard/results/[jobId]
```

### Blog Publishing Flow

```
User previews article at /dashboard/articles/[id]
  → publishArticle() server action
    → status → "published", sets publishedAt

Article now live at tenant.blogger.com/article/slug
  → Middleware rewrites to /blog/[tenant]/[slug]
  → Server-rendered with Schema.org JSON-LD
  → Related articles via pgvector cosine similarity
```

### User Sync Flow

```
Clerk auth event (user.created | user.updated | user.deleted)
  → POST /api/webhooks/clerk
  → Svix signature verification
  → Zod schema validation (clerkWebhookEventSchema)
  → INSERT / UPDATE / DELETE on users table
```

## Environment Variables

### lokal0

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

### content-gen

| Variable           | Purpose                                        |
| ------------------ | ---------------------------------------------- |
| `DATABASE_URL`     | PostgreSQL connection string                    |
| `TAVILY_API_KEY`   | Tavily crawling + web search                    |
| `SEO_API_URL`      | URL to seo-api                                  |
| `SEO_API_TOKEN`    | Bearer token for seo-api                        |
| `API_BEARER_TOKEN` | Bearer token that lokal0 must present            |
| `GEMINI_API_KEY`   | Google Gemini embeddings                         |
| `ANTHROPIC_API_KEY`| Anthropic Claude for content agent               |
| `PIONEER_API_KEY`  | Pioneer AI for intent classification             |

### seo-api

| Variable            | Purpose                                       |
| ------------------- | --------------------------------------------- |
| `DATAFORSEO_API_KEY`| Base64 of `LOGIN:PASSWORD` for DataForSEO      |
| `API_BEARER_TOKEN`  | Bearer token that content-gen must present      |
| `PORT`              | Server port (default 3000)                      |

## Authentication

### User Authentication (Clerk)

- `ClerkProvider` wraps the root layout for session management
- `clerkMiddleware` in `middleware.ts` protects all non-public routes
- `getRequiredUserId()` and `getRequiredAuth()` in `lib/auth.ts` guard server-side access
- Webhook events verified via Svix signature validation

### Service-to-Service Authentication

All inter-service calls use Bearer token auth:

- `lokal0 → content-gen`: `CONTENT_GEN_TOKEN` ↔ `API_BEARER_TOKEN`
- `content-gen → seo-api`: `SEO_API_TOKEN` ↔ `API_BEARER_TOKEN`

## Multi-Tenant Blog

Subdomain routing handled by middleware in `middleware.ts`:

```
{tenant}.blogger.com/              → /blog/{tenant}
{tenant}.blogger.com/article/{slug} → /blog/{tenant}/{slug}
```

URL construction in `lib/blog-url.ts` handles protocol detection (http for localhost, https for production).

## Design Patterns

### Domain-Driven Organization (lokal0)

- **`domains/`** contains types, Zod schemas, and constants per entity
- **`services/`** contains server actions with business logic
- Domain types are the source of truth; DB schema stores the persistence representation

### Three-Layer Architecture (seo-api)

```
Routes (Zod validation) → Services (business logic) → DataForSEO client (HTTP)
```

### Pipeline with SSE (content-gen)

10-stage pipeline runs as a background `asyncio.create_task`. Progress emitted as SSE events, proxied through lokal0 to the browser. Supports hydration from DB on page refresh.

### Pure Scoring Functions (lokal0)

`buildCategories()` and `buildCompetitors()` compute audit scores from business data without side effects.

### Zod-First Validation

All external inputs are validated with Zod schemas before processing across all three services.

### Upsert-First Persistence

Both `createArticle` and `findOrCreateProfile` use Drizzle's `onConflictDoUpdate` for idempotent operations.

## Deployment

All three services deploy via Docker, with content-gen and seo-api using Kamal v2 to a shared Hetzner VPS.

### lokal0

Multi-stage Docker build using Bun:

```dockerfile
FROM oven/bun:1 AS deps     → bun install --frozen-lockfile
FROM oven/bun:1 AS build    → bun run build
FROM oven/bun:1 AS runtime  → bun server.js (port 3000)
```

### content-gen

Multi-stage Docker build using Python 3.14 + uv:

```dockerfile
FROM python:3.14-slim → uv sync → NLTK data → uvicorn (port 8000)
```

Deployed via Kamal v2 to Hetzner VPS. GHCR registry.

### seo-api

Three-stage Docker build using Node 22 Alpine:

```dockerfile
FROM node:22-alpine → npm ci → tsc → node dist/index.js (port 3000)
```

Deployed via Kamal v2 to same Hetzner VPS. GHCR registry.
