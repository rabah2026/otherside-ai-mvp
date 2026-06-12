# User POV Review — OtherSide AI Result Logic

## User experience issue

The current product can still feel like a chatbot instead of a serious counter-perspective brief. The output may be short, generic, weakly sourced, or awkward in Arabic.

## What users expect

Users expect:

- a structured report, not a casual answer;
- strong evidence before interpretation;
- official English sources as the main evidence base;
- polished Arabic synthesis when the request is Arabic;
- Arabic context sources only when the topic itself has Arabic or local context;
- no verdict and no winner selection;
- clear uncertainty when official evidence is missing.

## Quality gate

A result should not be shown unless it includes:

- at least three meaningful paragraphs;
- a complete counter-argument paragraph;
- two agreement points;
- two disputed points;
- two source notes;
- no casual wording;
- no mixed-language leakage in Arabic;
- no invented source names.

## Evidence policy

The ideal flow is:

1. Detect input language and topic context.
2. Search official English sources first.
3. Filter sources to official or primary institutions.
4. Add Arabic context sources only when the subject needs Arabic context.
5. Generate the report from official English evidence.
6. Translate and synthesize into Arabic when needed.
7. Retry once if the report fails quality checks.
8. Fall back only when the model cannot produce a valid report.

## Implementation status

Completed:

- Added an official evidence search layer in `src/lib/web-search.ts`.
- Added separation between official English evidence and Arabic context sources.
- Added source formatting that tells the model how to use evidence.

Still required:

- Wire `src/app/api/generate/route.ts` to the new evidence layer.
- Replace generic search with the new official-evidence flow.
- Include the new evidence context in the main prompt and retry prompt.
- Add stricter validation against weak or invented source notes.
