export type OtherSideMode = 'quick' | 'deep' | 'history';
export type SourceStrictness = 'balanced' | 'strict' | 'reasoned';
export type SourceStrength = 'strong' | 'medium' | 'weak' | 'missing';
export type SourceType =
  | 'official_statement'
  | 'court_filing'
  | 'reporting'
  | 'primary_source'
  | 'historical_record'
  | 'unknown';

export interface StoryAnalysis {
  inputType:
    | 'tweet_or_social_post'
    | 'article'
    | 'speech'
    | 'historical_narrative'
    | 'legal_claim'
    | 'business_dispute'
    | 'unclear';
  mainClaim: string;
  mainParty: string;
  targetOrOtherParty: string;
  topic: string;
  timeframe: string | null;
  isCurrentEvent: boolean;
  requiresWebResearch: boolean;
  sensitiveTopic: 'legal' | 'medical' | 'financial' | 'politics' | 'violence' | 'none';
  confidence: 'high' | 'medium' | 'low';
  assumptions: string[];
}

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

export interface GenerateReportInput {
  text: string;
  mode: OtherSideMode;
  sourceStrictness: SourceStrictness;
}

export interface GenerateReportOutput {
  report: OtherSideReport;
  demoMode: boolean;
}
