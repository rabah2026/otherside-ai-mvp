const BANNED_PHRASES = [
  'the truth is',
  'clearly right',
  'obviously wrong',
  'proves that',
  'is lying',
  'the correct side',
  'you should believe',
];

const REPLACEMENTS: Record<string, string> = {
  'the truth is': 'one interpretation is',
  'clearly right': 'arguably better supported',
  'obviously wrong': 'disputed by the other side',
  'proves that': 'is used to argue that',
  'is lying': 'may be disputed by available statements',
  'the correct side': 'one side of the dispute',
  'you should believe': 'a reader may consider',
};

export function findNeutralityIssues(text: string): string[] {
  const lower = text.toLowerCase();
  return BANNED_PHRASES.filter((phrase) => lower.includes(phrase));
}

export function softRewriteNeutrality(text: string): string {
  let result = text;

  for (const [bad, replacement] of Object.entries(REPLACEMENTS)) {
    const regex = new RegExp(bad, 'gi');
    result = result.replace(regex, replacement);
  }

  return result;
}
