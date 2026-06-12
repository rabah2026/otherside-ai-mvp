# User POV Review — Results Logic

The result must feel like a serious evidence brief, not a casual chatbot answer.

## Standard

A report should include three paragraphs, a full counter-argument, two agreement points, two disputed points, two source notes, no casual wording, no mixed-language leakage, and no invented sources.

## Evidence rule

Use official English evidence first. If the user asks in Arabic, translate and synthesize that evidence into Arabic. Add Arabic context sources only when the topic itself has Arabic or local context.

## Done

The search layer now separates official English evidence from Arabic context sources. The generation route now consumes that evidence block and includes it in the main prompt and Arabic retry prompt.

## Next

Add post-generation source-note validation and tests for Arabic requests, subjective ranking claims, and cases with missing official evidence.
