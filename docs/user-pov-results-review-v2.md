# User POV Review — Results Logic

## User issue

The result must feel like a serious evidence brief, not a casual chatbot answer.

## Expected result standard

A visible report should include:

- three meaningful paragraphs;
- one complete counter-argument paragraph;
- two agreement points;
- two disputed points;
- two source notes;
- no casual wording;
- no mixed Arabic/English leakage;
- no invented sources.

## Evidence rule

The report should use official English evidence first. If the user asks in Arabic, the answer should translate and synthesize that evidence into Arabic. Arabic sources should be added only when the topic itself has Arabic or local context.

## Completed

- Added official evidence search helpers.
- Added separate official English and Arabic context source buckets.
- Wired the generation route to use the official evidence context.
- Added the evidence context to Arabic retry prompts.

## Still recommended

- Add source-note validation after generation.
- Add tests for Arabic requests and ranking claims.
- Add hidden debug info for fallback reasons.
