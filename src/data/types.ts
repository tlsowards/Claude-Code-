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
  /** Verification limits carried over from the research. Internal: not shown to readers, read aloud, or copied into the video kit. */
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
  /** Research coverage and limits, stated plainly. Internal: kept for the editors, not shown on the brief page. */
  coverage: string[];
  sections: BriefSection[];
  /** The training application block. caseId ties a point to a case for the video kit's post schedule. */
  applications: { title: string; body: string; caseId?: string }[];
  episodeIds: string[];
  /** Short knowledge check shown at the end of the brief. */
  quiz?: QuizQuestion[];
  /** Hand-written YouTube title options and thumbnail text, read by scripts/build-youtube-kit.mjs. */
  youtube?: {
    /** Title options and thumbnail used for the first video when that video does not carry its own. */
    titles?: string[];
    thumbnail?: { text?: string; redWord?: string; visual?: string };
    /**
     * The individual case videos for the channel: one decision, or two or three on the same issue. Cases not
     * listed get Shorts only. Without this block every published decision gets its own video.
     */
    videos?: { cases: string[]; titles?: string[]; thumbnail?: { text?: string; redWord?: string; visual?: string }; hook?: string }[];
  };
}

/**
 * A standalone teaching brief in the Case library: one decision, written in the same facts, holding,
 * practice, and training structure as a weekly brief case, but not tied to a week. Lives in content/cases.
 */
export type CaseCategory =
  | 'force-standards' | 'deadly-force' | 'intermediate-force' | 'impact-weapons' | 'takedowns-and-control'
  | 'handcuffing-and-detention' | 'restraint-and-asphyxia' | 'mental-health-and-disability' | 'custody-and-corrections'
  | 'qualified-immunity' | 'instructor-and-training-liability' | 'training-injury' | 'california-law' | 'supervision-and-intercede';

export interface TeachingBrief extends BriefCase {
  /** ISO date the brief was added to the library. Drives ordering and the sitemap. */
  published: string;
  /** Library sections this brief belongs to, in order of importance; the first is where it is shelved. */
  categories?: CaseCategory[];
  /** Why this case is in the library, one or two sentences, shown on the list page and free to read. */
  summary: string;
  /** Verification notes: what was read and what was not. */
  coverage?: string[];
  /** Briefing room points, subscribers only. */
  applications?: { title: string; body: string }[];
  quiz?: QuizQuestion[];
  /** Weekly brief ids that discuss this case, in addition to any found by name. */
  relatedBriefIds?: string[];
  /** Related standards and the California layer: short titled sections shown after the case, subscribers only. */
  context?: { title: string; body: string }[];
  /** Narration of the brief in Dr. Sowards' voice, hosted in the website's media library. Subscribers only. */
  audio?: { url: string; durationSeconds: number; bytes?: number };
  /** Hand-written title options, thumbnail, and description hook for the case's evergreen channel video, read by scripts/build-case-kit.mjs. */
  youtube?: { titles?: string[]; thumbnail?: { text?: string; redWord?: string; visual?: string }; hook?: string };
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
