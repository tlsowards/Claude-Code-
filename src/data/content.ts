import type { WeeklyBrief, Episode, Course, LiveCourse, ResourceCategory, DuckStage } from './types';
import episodesJson from '../../content/episodes.json';
import coursesJson from '../../content/courses.json';
import liveJson from '../../content/courses.live.json';
import metaJson from '../../content/courses.meta.json';
import resourcesJson from '../../content/resources.json';
import duckJson from '../../content/duck.json';
import pc835aJson from '../../content/pc835a.json';

// Every brief in content/briefs is loaded at build time. Add a file, rebuild, and it appears.
const briefModules = import.meta.glob('../../content/briefs/*.json', { eager: true }) as Record<string, { default: WeeklyBrief }>;

export const briefs: WeeklyBrief[] = Object.values(briefModules)
  .map((m) => m.default)
  .sort((a, b) => (a.date < b.date ? 1 : -1));

export function getBrief(id: string): WeeklyBrief | undefined {
  return briefs.find((b) => b.id === id);
}

export const episodes: Episode[] = (episodesJson as Episode[]).slice().sort((a, b) => (a.date < b.date ? 1 : -1));

export function getEpisode(id: string): Episode | undefined {
  return episodes.find((e) => e.id === id);
}

const meta = metaJson.byId as Record<string, { stcNumber?: string; track?: string; hours?: string }>;

/** Online courses read from the live site at build time, merged with hand-maintained details. */
export const liveCourses: LiveCourse[] = (liveJson.courses as LiveCourse[]).map((c) => ({ ...c, ...(meta[String(c.id)] ?? {}) }));
export const catalogFetchedAt: string | null = liveJson.fetchedAt as string | null;
export const upcomingCourses = coursesJson.upcoming as Course[];
export const pricingNote = coursesJson.pricingNote as string;
export const catalogNote = coursesJson.snapshotNote as string;

export const resourceIntro = resourcesJson.intro as string;
export const resourceCategories = resourcesJson.categories as ResourceCategory[];

export const duck = duckJson as {
  title: string;
  subtitle: string;
  intro: string[];
  preaConnection: string;
  stages: DuckStage[];
  interventionPrinciple: { title: string; body: string };
  supervisors: { title: string; bullets: string[] };
};

export const pc835a = pc835aJson as {
  title: string;
  subtitle: string;
  intro: string[];
  sections: {
    title: string;
    body: string[];
    whatThisMeans?: string;
    checklist?: { element: string; why: string }[];
    training?: { area: string; detail: string }[];
  }[];
  footer: string;
};

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function formatRange(start: string, end: string): string {
  const [ys, ms, ds] = start.split('-').map(Number);
  const [ye, me, de] = end.split('-').map(Number);
  const s = new Date(ys, ms - 1, ds);
  const e = new Date(ye, me - 1, de);
  const sStr = s.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const eStr = e.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return `${sStr} to ${eStr}`;
}

/** The one case of a brief that everyone can read without a subscription: the first case of the first section that has cases. */
export function previewCaseId(brief: WeeklyBrief): string | undefined {
  return brief.sections.find((s) => s.cases.length > 0)?.cases[0]?.id;
}
