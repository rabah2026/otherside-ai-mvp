# Architecture

## Recommended MVP architecture

```text
Next.js App Router
  /app routes
  /api/analyze
  /api/generate
  /api/report/[id]

Core services
  storyExtractor
  sourceResearcher
  counterStoryGenerator
  reportFormatter
  neutralityGuard

Adapters
  aiProvider/openai.ts
  searchProvider/mock.ts
  searchProvider/tavily.ts later
  storage/supabase.ts optional
```

## Data flow

1. User submits text and mode.
2. `/api/analyze` extracts claim, main party, other party, risk flags.
3. If current event or source strictness is enabled, source researcher searches web/provider.
4. `/api/generate` produces structured report.
5. Neutrality guard checks for judgment language.
6. Report is displayed and optionally saved.

## Neutrality guard

Simple MVP guard:

- Scan final text for banned phrases:
  - “the truth is”
  - “clearly right”
  - “obviously wrong”
  - “proves that”
  - “is lying”
- If found, ask the model to rewrite in neutral language.

## Provider adapter interface

```ts
export interface AIProvider {
  generateJSON<T>(input: {
    system: string;
    prompt: string;
    schemaName: string;
  }): Promise<T>;
}
```

## Search adapter interface

```ts
export interface SearchProvider {
  search(query: string): Promise<Array<{
    title: string;
    url: string;
    snippet: string;
    sourceType?: string;
  }>>;
}
```
