# OtherSide AI — الجانب الآخر

> **Every story has another side.** / **لكل رأي جانب آخر.**

A neutral, non-partisan dispute analysis tool. Paste any claim, article, tweet,
or historical narrative, and OtherSide AI constructs the strongest fair version
of the *opposing* side — backed by named sources, without ever giving a verdict.
Fully bilingual (English / Arabic) with light & dark themes.

---

## How it works

1. **Submit** — paste one side of a story.
2. **Detect** — the AI identifies the parties and the core claim.
3. **Construct** — a neutrality-guarded counter-report is generated with
   evaluated sources, points of agreement, disputed points, and uncertainties.

The report is rendered as an accordion brief and can be exported as **PNG** or **PDF**.

---

## Quick start (local)

```bash
npm install
cp .env.example .env.local   # then fill in your keys
npm run dev
```

Open <http://localhost:3000>.

> The app runs **without any keys** — it falls back to curated demo reports.
> To get live AI generation and real web references, set the variables below.

---

## Environment variables

| Variable          | Required | Purpose                                                            |
| ----------------- | :------: | ------------------------------------------------------------------ |
| `AI_API_BASE_URL` |    ✓     | OpenAI-compatible endpoint (e.g. `https://api.z.ai/api/coding/paas/v4`). |
| `AI_MODEL`        |    ✓     | Model id (e.g. `glm-4.7`).                                         |
| `OPENAI_API_KEY`  |    ✓     | API key for the provider above.                                   |
| `SERPER_API_KEY`  | optional | Live Google search for real citations. Free tier at serper.dev.   |

All values are read **server-side only** — they are never exposed to the browser.

---

## Deploy to Vercel

1. Push this repo to GitHub and **Import** it in Vercel (framework auto-detected: Next.js).
2. In **Settings → Environment Variables**, add the four variables from the table
   above (set them for *Production* and *Preview*).
3. Click **Deploy**. That's it — no build configuration needed.

To change keys later, update them in Vercel and **Redeploy**.

> 🔒 **Security:** never put API keys in the code or commit `.env.local`.
> Manage them only through Vercel's Environment Variables.

---

## Tech stack

- **Next.js 16** (App Router) + **React 19**
- **Tailwind CSS v4** — class-based dark mode, RTL-aware
- **lucide-react** icons · **jspdf** + **html2canvas** for export
- Any **OpenAI-compatible** model · optional **Serper** web search
