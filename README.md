# Growth Engine

**Turn your product into customers.**

AI growth team that researches your product, finds audiences, creates strategy and platform-native campaigns — with human approval for publishing and spend.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS 4
- Supabase (Auth, Postgres, RLS)
- Agent task system with persistent status + retry

## Core loop (MVP + Phase 2)

1. Paste product URL
2. Product analysis (FACT from page + labeled AI inference)
3. Market intelligence (channels, pains, competitors — no fabricated external research)
4. Audience discovery
5. Growth strategy with ranked channels + Explain Why
6. Platform-specific campaign drafts
7. User approval required
8. Growth score (transparent factors)
9. Experiment drafts + lifecycle (no winner without real data)
10. Growth memory for future recommendations

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill from Supabase project:

```
NEXT_PUBLIC_SUPABASE_URL=https://ejvyklqdqirxfccevvwv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role — server only>
```

## Security

- RLS on all user tables
- Service role never in client
- Approval required for campaigns and experiment launch
- No spam automation
- Unavailable research sources labeled "Source not connected"

## Deploy (Vercel)

1. Import repo
2. Set env vars
3. Add production URL to Supabase Auth redirects
