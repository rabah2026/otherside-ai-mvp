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

const ARABIC_LEAKAGE_FIXES: Record<string, string> = {
  nexus: 'صلة',
  claim: 'ادعاء',
  claims: 'ادعاءات',
  vojna: 'حرب',
  war: 'حرب',
  link: 'صلة',
  connection: 'علاقة',
  present: 'يعرض',
  suggests: 'يشير',
  argues: 'يجادل',
  states: 'يذكر',
  notes: 'يلاحظ',
  shows: 'يُظهر',
  dispute: 'نزاع',
  argument: 'حجة',
  narrative: 'رواية',
  sonder: 'بل',
  sondern: 'بل',
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

export function cleanArabicLeakage(text: string): string {
  if (!text || !/[؀-ۿ]/.test(text)) return text;
  let result = text;
  for (const [latin, arabic] of Object.entries(ARABIC_LEAKAGE_FIXES)) {
    result = result.replace(new RegExp(`(ال)?\\b${latin}\\b`, 'gi'), arabic);
  }
  // Strip isolated Latin fragments that sometimes leak into Arabic output while keeping URLs and brand-like tokens intact.
  result = result.replace(/(?<!https?:\/\/)(?<![A-Za-z0-9./_-])\b[a-z]{3,}\b(?![A-Za-z0-9./_-])/gi, '').replace(/\s{2,}/g, ' ').trim();
  return result;
}
