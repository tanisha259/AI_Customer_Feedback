# LOOP — AI Customer-Feedback Intelligence Platform

Built for the Zidio Development "Project LOOP" internship brief. Turns
scattered customer feedback into ranked, evidence-backed insights: themes,
sentiment, trends, and grounded answers.

## Tech stack

| Layer        | Technology                                   |
|--------------|-----------------------------------------------|
| Framework    | Next.js 14 (App Router) + TypeScript          |
| Styling      | Tailwind CSS                                  |
| Database     | PostgreSQL (Neon or Supabase free tier)       |
| ORM          | Prisma                                        |
| Auth         | NextAuth (Auth.js), Credentials provider, JWT sessions |
| AI           | Anthropic Claude API (`@anthropic-ai/sdk`)    |
| Embeddings   | Voyage AI (`voyage-3`) for Ask LOOP retrieval |
| Charts       | Recharts                                      |
| Validation   | Zod on every API boundary                     |
| Deployment   | Vercel + hosted Postgres                      |

## What's implemented

**Core (Section 08, C1–C5)**
- Multi-tenant workspaces, 3 roles (Admin / Analyst / Viewer), enforced
  server-side in every API route via `lib/rbac.ts` — not just hidden buttons.
- Every tenant-owned query filters on `workspaceId`; row-level ownership is
  re-checked before any update (`assertWorkspaceScope`) so guessing an id in
  the URL can never leak or mutate another company's data.
- Feedback ingestion: single entry, CSV bulk import, simulated channel pull.
- Inbox: server-side pagination, search, filters, inline status workflow.
- Dashboard: volume/sentiment/top-themes charts driven by real data.

**AI (Section 08, AI1–AI4)**
- **AI1 Auto-classification** — `lib/ai.ts::classifyFeedback` returns
  structured JSON (sentiment, score, themes, feature area), Zod-validated,
  with a retry-then-fallback path if Claude's output doesn't parse.
- **AI2 Theme clustering & trends** — `app/api/themes/route.ts` computes
  per-theme volume for the last 14 days vs. the 14 before and flags spikes.
- **AI3 Ask LOOP** — real retrieval-then-answer: embed the question (Voyage),
  cosine-similarity search over this workspace's stored embeddings only,
  pass just those items to Claude with a hard grounding instruction, return
  the answer plus the exact cited items.
- **AI4 Voice-of-Customer report** — stats are computed directly from
  Postgres first; Claude only writes the narrative around real numbers, so
  it can't invent figures.

## Local setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# fill in DATABASE_URL, NEXTAUTH_SECRET, ANTHROPIC_API_KEY, VOYAGE_API_KEY

# 3. Set up the database
npx prisma migrate dev --name init
npm run seed

# 4. Run locally
npm run dev   # http://localhost:3000
```

### Environment variables

| Variable            | Purpose                                                    |
|---------------------|-------------------------------------------------------------|
| `DATABASE_URL`      | Postgres connection string (Neon/Supabase free tier both work) |
| `NEXTAUTH_SECRET`   | `openssl rand -base64 32`                                   |
| `NEXTAUTH_URL`      | `http://localhost:3000` locally; your Vercel URL in prod     |
| `ANTHROPIC_API_KEY` | Server-side only — never exposed to the browser              |
| `VOYAGE_API_KEY`    | Powers Ask LOOP's semantic retrieval (get one at dashboard.voyageai.com) |

### Demo credentials (seeded workspace "Northwind Analytics")

| Role    | Email                    | Password       |
|---------|--------------------------|----------------|
| Admin   | admin@northwind.demo     | Password123!   |
| Analyst | analyst@northwind.demo   | Password123!   |
| Viewer  | viewer@northwind.demo    | Password123!   |

**Change or remove these before deploying anywhere public.**

## Architecture

Three-tier flow, matching Section 06 of the brief:

```
Browser (React Server/Client Components)
   -> Next.js API route handlers (auth + role guard + Zod validation)
      -> Prisma -> PostgreSQL   (every query scoped by workspaceId)
      -> Claude API              (classify / answer / report — server-side only)
      -> Voyage AI                (embeddings for Ask LOOP retrieval)
```

The browser never calls Claude or Voyage directly — only your own API routes
do, so API keys never reach client code.

## Repository structure

```
app/
  (auth)/login, signup            # public pages
  (app)/dashboard, inbox,         # protected pages (middleware.ts gates these)
        trends, ask, reports
  api/
    auth/[...nextauth]            # NextAuth handler
    signup                        # creates Workspace + first Admin User
    feedback                      # GET (list/filter/paginate), POST (create+classify)
    feedback/[id]                 # PATCH status
    feedback/[id]/reclassify      # manual re-classify
    feedback/import               # CSV bulk import
    feedback/simulate-channel     # simulated channel pull
    themes                        # theme counts + trend/spike calc
    insights                      # Ask LOOP (retrieve-then-answer)
    reports                       # GET list, POST generate VoC report
    reports/[id]                  # single report
components/
  app-shell.tsx                   # sidebar + topbar
  session-provider.tsx            # client wrapper for NextAuth session
lib/
  db.ts                           # Prisma singleton
  auth.ts                         # NextAuth config
  rbac.ts                         # session + role guard, workspace-scope check
  ai.ts                           # Claude calls: classify, answer, report
  search.ts                       # cosine similarity + top-K retrieval
prisma/
  schema.prisma
  seed.ts                         # demo workspace, 3 users, ~40 feedback items
```

## Upgrading to pgvector

`Embedding.vector` is a plain `Float[]` for portability across free-tier
Postgres providers, with cosine similarity computed in application code
(`lib/search.ts`). This is fine at demo scale. For production-scale ANN
search: enable the `pgvector` extension, change the column to
`Unsupported("vector(1024)")` in `schema.prisma`, and replace the
`db.embedding.findMany` + in-memory `retrieveTopK` in
`app/api/insights/route.ts` with a raw SQL `ORDER BY embedding <=> $1 LIMIT k`
query.

## Known simplifications vs. a full production build

- CSV parsing in `app/api/feedback/import/route.ts` is a minimal splitter —
  swap for a proper library (e.g. `csv-parse`) if you need quoted fields
  containing commas.
- No rate limiting on the Claude/Voyage calls — add one before any public
  deployment to control cost.
- Member invitation UI (Admin inviting teammates by email) is not wired up;
  the API/schema support multiple users per workspace, but there's no invite
  flow yet — currently new users create their own new workspace via signup.
