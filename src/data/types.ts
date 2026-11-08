export type CaseStatus = 'published' | 'unpublished' | 'order' | 'cert-denied' | 'summary-order' | 'unknown';

export interface BriefCase {
  id: string;
  name: string;
  court: string;
  /** Court key used to build "find the opinion" links. */
  courtKey: CourtKey;
  docket?: string;
  citation?: string;
  decided: string;
  status: CaseStatus;
  /** Short line on what kind of claim it is: force, custody, search, seizure, etc. */
  topic: string;
  /** Where the case applies most: field, custody, juvenile, supervisors, all. */
  settings: Setting[];
  facts: string;
  holding: string;
  dissent?: string;
  notDecided?: string;
  inPractice: string;
  trainIt: string;
  /** Verification flags carried over from the research, shown to the reader. */
  caution?: string;
}

export type CourtKey =
  | 'scotus' | 'ca9' | 'ca1' | 'ca2' | 'ca3' | 'ca4' | 'ca5' | 'ca6' | 'ca7' | 'ca8' | 'ca10' | 'ca11' | 'cadc'
  | 'calsupreme' | 'calapp';

export type Setting = 'field' | 'custody' | 'juvenile' | 'supervisors' | 'all';

export interface BriefSection {
  heading: string;
  /** Short narrative when a section has no qualifying case, or framing for the section. */
  note?: string;
  cases: BriefCase[];
}

export interface WeeklyBrief {
  id: string;
  title: string;
  /** ISO date the brief is dated. */
  date: string;
  coverageStart: string;
  coverageEnd: string;
  summary: string;
  /** Research coverage and limits, stated plainly. */
  coverage: string[];
  sections: BriefSection[];
  /** The training application block. */
  applications: { title: string; body: string }[];
  episodeIds: string[];
  /** Short knowledge check shown at the end of the brief. */
  quiz?: QuizQuestion[];
}

export interface QuizQuestion {
  q: string;
  options: string[];
  /** Index into options. */
  answer: number;
  /** Teaching point shown after the reader answers. */
  teach: string;
}

export interface Episode {
  id: string;
  title: string;
  date: string;
  description: string;
  /** File name under the audio base URL, used when audioUrl is not set. */
  file: string;
  /** Full URL of the MP3 when it is hosted somewhere specific, such as the website's media library. */
  audioUrl?: string;
  bytes: number;
  /** Seconds, when measured. */
  durationSeconds?: number;
  briefId?: string;
}

export interface Course {
  id: string;
  title: string;
  track?: string;
  stcNumber?: string;
  hours?: string;
  format: string;
  audience: string;
  summary: string;
  outcomes: string[];
  status: 'live' | 'stc-review' | 'in-development' | 'in-person';
  url?: string;
}

export interface LiveCourse {
  id: number;
  slug: string;
  title: string;
  url: string;
  excerpt: string;
  audience: string;
  totalTime: string;
  modules: string[];
  plans: { name: string; price: string }[];
  image: string;
  updated: string;
  /** Merged from content/courses.meta.json */
  stcNumber?: string;
  track?: string;
  hours?: string;
}

export interface ResourceLink {
  title: string;
  url: string;
  description: string;
  /** Marked true when the content is paid or membership-based. */
  paid?: boolean;
}

export interface ResourceCategory {
  id: string;
  title: string;
  description: string;
  links: ResourceLink[];
}

export interface DuckStage {
  number: number;
  title: string;
  body: string;
  bullets?: string[];
  warningSign: string;
}
