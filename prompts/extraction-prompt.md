# Extraction Prompt

Analyze the user input and extract the dispute structure.

User input:
{{USER_INPUT}}

Return JSON only:

{
  "inputType": "tweet_or_social_post | article | speech | historical_narrative | legal_claim | business_dispute | unclear",
  "mainClaim": "string",
  "mainParty": "string",
  "targetOrOtherParty": "string",
  "topic": "string",
  "timeframe": "string or null",
  "isCurrentEvent": true,
  "requiresWebResearch": true,
  "sensitiveTopic": "legal | medical | financial | politics | violence | none",
  "confidence": "high | medium | low",
  "assumptions": ["string"]
}
