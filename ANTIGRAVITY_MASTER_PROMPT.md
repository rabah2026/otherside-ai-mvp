# Antigravity Master Prompt — Build OtherSide AI

You are building **OtherSide AI**, a polished web app that lets users paste any story, claim, tweet, article excerpt, URL, or historical narrative and receive the strongest fair version of the other side’s story.

The product must never judge who is right. It must not give opinions. It must only present the counter-position, disputed points, agreed facts, source notes, and uncertainty.

## Build objective

Create a production-quality Next.js web app MVP with a premium editorial design and working AI generation flow.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Use clean custom components or shadcn/ui if already available
- API routes for analysis and report generation
- Provider adapter pattern for AI and search
- Supabase optional, but keep interfaces ready

## Product identity

Name: OtherSide AI
Tagline: Every story has another side.
Promise: No judgment. No winner. No moral lecture. Just the missing perspective.

## Required pages

1. `/` landing page
2. `/app` input page
3. `/result/[id]` result page, can use local/mock ID first
4. `/examples` examples page
5. `/about` neutrality policy page

## Required MVP behavior

On `/app`, user can paste text and select one of three modes:

- Quick Counter
- Deep Dispute
- History Mirror

When submitted:

1. Analyze the input.
2. Detect main claim, main party, other party, topic, current-event risk, sensitivity.
3. Generate a structured neutral counter-story report.
4. Run a neutrality guard to remove verdict/opinion language.
5. Render the report in a polished case-brief UI.

If API keys are missing, the app should fall back to a mock response and clearly mark it as demo mode.

## Required report structure

- Detected Story
- Main Party
- Other Party
- Other Side’s Story
- Strongest Counter-Argument
- What Both Sides Agree On
- What Is Disputed
- Source Notes
- Uncertainty Notes
- Neutral Note

## JSON schema

Use this report shape:

```ts
export type SourceStrength = 'strong' | 'medium' | 'weak' | 'missing';
export type SourceType = 'official_statement' | 'court_filing' | 'reporting' | 'primary_source' | 'historical_record' | 'unknown';

export interface SourceNote {
  sourceType: SourceType;
  note: string;
  strength: SourceStrength;
  title?: string;
  url?: string;
}

export interface OtherSideReport {
  detectedStory: string;
  mainParty: string;
  otherParty: string;
  otherSideStory: string;
  strongestCounterArgument: string;
  bothSidesAgreeOn: string[];
  disputedPoints: string[];
  sourceNotes: SourceNote[];
  uncertaintyNotes: string[];
  neutralNote: string;
}
```

## Visual direction

The app should feel like a premium intelligence desk, not a debate forum.

Use:

- Cinematic editorial composition
- Dark atmospheric background
- Elegant whitespace
- Large sharp typography
- Soft gradients
- Thin dividers
- Subtle glass/depth layers
- No repetitive boxed infographic layout
- No red-vs-blue fighting theme

## Landing page content

Hero headline:

> Every story has another side.

Subheadline:

> Paste a claim, article, tweet, or historical narrative. OtherSide AI shows the other party’s story without giving a verdict.

CTA:

> Show me the other side

Trust line:

> No judgment. No winner. No moral lecture. Just the missing perspective.

## Core components

Create components:

- `HeroSection`
- `ModeSelector`
- `StoryInput`
- `ReportBrief`
- `EvidenceStrip`
- `DisputedPoints`
- `NeutralityBadge`
- `SourceStrengthBadge`
- `DemoExamplePanel`

## API routes

### `POST /api/analyze`

Input:

```ts
{
  text: string;
  mode: 'quick' | 'deep' | 'history';
}
```

Output:

```ts
{
  inputType: string;
  mainClaim: string;
  mainParty: string;
  targetOrOtherParty: string;
  topic: string;
  timeframe: string | null;
  isCurrentEvent: boolean;
  requiresWebResearch: boolean;
  sensitiveTopic: string;
  confidence: 'high' | 'medium' | 'low';
  assumptions: string[];
}
```

### `POST /api/generate`

Input:

```ts
{
  text: string;
  mode: 'quick' | 'deep' | 'history';
  sourceStrictness: 'balanced' | 'strict' | 'reasoned';
}
```

Output:

```ts
{
  report: OtherSideReport;
  demoMode: boolean;
}
```

## Neutrality guard

Add a guard that checks report text for banned phrases:

- “the truth is”
- “clearly right”
- “obviously wrong”
- “proves that”
- “is lying”
- “the correct side”
- “you should believe”

If found, rewrite or replace with neutral phrasing.

## Implementation order

1. Scaffold app and design system.
2. Build landing page and `/app` UI.
3. Build mocked report generation.
4. Add AI provider adapter.
5. Add prompts from `/prompts` folder.
6. Add API routes.
7. Add neutrality guard.
8. Add result page and examples.
9. Polish responsive mobile experience.
10. Add README with setup instructions.

## Quality bar

The app must feel professional enough that users trust it as a serious research product. It should not look like a generic AI wrapper.

## Final acceptance test

When a user pastes:

> Elon Musk says OpenAI betrayed its original nonprofit mission and became too close to Microsoft.

The app should return a neutral report explaining OpenAI’s counter-position without deciding who is right.
