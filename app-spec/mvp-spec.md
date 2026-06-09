# MVP Spec

## MVP name

OtherSide AI

## Primary user journey

1. User opens the landing page.
2. User clicks “Try it”.
3. User pastes a story, claim, article excerpt, tweet text, or URL.
4. User selects optional mode:
   - Quick Counter
   - Deep Dispute
   - History Mirror
5. User clicks “Show the other side”.
6. App returns a structured report.
7. User can copy, save, or regenerate with a different mode.

## Input types

MVP supports:

- Raw pasted text
- URL pasted as text, but URL extraction can be mocked at first

Later versions:

- Browser extension
- PDF upload
- Tweet/X link ingestion
- YouTube transcript ingestion
- News article extraction

## Modes

### Quick Counter
For short claims, tweets, social posts.

Output should be concise.

### Deep Dispute
For legal, company, political, or public controversies.

Output should include timeline, parties, claims, disputes, and source map.

### History Mirror
For historical narratives.

Output should identify the omitted side, affected communities, and competing historical interpretations.

## Result sections

1. **Detected Story**
   - Summary of the user’s pasted story.

2. **Main Party**
   - Who is making the claim or whose view is represented.

3. **Other Party**
   - Who is being criticized, opposed, affected, or omitted.

4. **Other Side’s Story**
   - Neutral explanation of the opposing narrative.

5. **Strongest Counter-Argument**
   - Steelman version of the other side.

6. **What Both Sides Agree On**
   - Shared facts, if any.

7. **What Is Disputed**
   - Claims, interpretations, motives, chronology, impact.

8. **Source Notes**
   - Which source types support or are needed.

9. **Neutral Note**
   - “This is not a verdict. It presents the other side’s argument.”

## User controls

- Tone: concise / detailed
- Mode: quick / deep / history
- Source strictness: public sources only / allow reasoned inference
- Output language: English first, Arabic later

## MVP limitations

If no sources are available, the app should say so clearly and produce a cautious “possible counter-position” rather than pretending certainty.
