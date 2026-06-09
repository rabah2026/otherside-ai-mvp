# Antigravity Build Tasks

## Phase 1 — Static polished prototype

- Create Next.js app with TypeScript and Tailwind.
- Build landing page.
- Build `/app` page with paste box and mode selector.
- Build report UI with mocked data.
- Implement premium visual design.

## Phase 2 — AI extraction and generation

- Add `/api/analyze` route.
- Add `/api/generate` route.
- Implement AI provider adapter.
- Implement prompts from `/prompts`.
- Return structured JSON.
- Render the report from JSON.

## Phase 3 — Neutrality guard

- Add banned judgment phrase scan.
- If risky language appears, rewrite using neutral language.
- Add source strength labels.

## Phase 4 — Search grounding

- Add search provider adapter.
- Start with mock results.
- Add Tavily or Exa later.
- Show sources in report.

## Phase 5 — Save and share

- Add Supabase reports table.
- Save report.
- Add `/result/[id]`.
- Add copy/export buttons.

## Done definition

A user can paste a claim, choose a mode, click submit, and receive a polished neutral other-side report with no verdict language.
