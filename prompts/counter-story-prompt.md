# Counter-Story Prompt

You are generating the other side of a story. Do not judge who is right.

Input analysis:
{{EXTRACTION_JSON}}

Available source notes:
{{SOURCE_NOTES}}

User selected mode:
{{MODE}}

Generate a neutral counter-story report.

Rules:

- Present the strongest fair version of the other side.
- Do not insult the original party.
- Do not declare the counter-position correct.
- Mention uncertainty when source support is limited.
- Distinguish what is agreed from what is disputed.
- Use the exact required JSON schema from the system prompt.

Mode behavior:

Quick Counter:
- Short, clear, no long timeline.

Deep Dispute:
- More complete, include timeline-style context inside the story where relevant.

History Mirror:
- Identify who is omitted or affected by the dominant narrative.
- Separate primary sources from later interpretation.
