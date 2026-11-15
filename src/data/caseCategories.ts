import type { CaseCategory } from './types';

/** The sections of the Case library, in display order. A brief can sit in more than one. */
export const caseCategories: { id: CaseCategory; label: string; blurb: string }[] = [
  { id: 'force-standards', label: 'Force standards', blurb: 'Objective reasonableness, the totality of the circumstances, and how courts judge a use of force after the fact.' },
  { id: 'deadly-force', label: 'Deadly force', blurb: 'When deadly force is justified, what counts as deadly force, and the cases on shootings and vehicles.' },
  { id: 'intermediate-force', label: 'Intermediate and less lethal force', blurb: 'Tasers, pepper spray, impact projectiles, pain compliance, and what justifies each.' },
  { id: 'impact-weapons', label: 'Impact weapons', blurb: 'Batons and other impact tools: target areas, warnings, and the force level courts assign them.' },
  { id: 'takedowns-and-control', label: 'Takedowns and control holds', blurb: 'When a takedown or control hold is reasonable, and when a compliant or passive person makes it excessive.' },
  { id: 'handcuffing-and-detention', label: 'Handcuffing and detention', blurb: 'Tight cuffs, the manner and length of a detention, and pointing firearms at people who are not threats.' },
  { id: 'restraint-and-asphyxia', label: 'Prone restraint and positional asphyxia', blurb: 'Body weight on a prone person, how long a restraint lasts, and monitoring after the fight is over.' },
  { id: 'mental-health-and-disability', label: 'Mental health and disability', blurb: 'Force against people in crisis or with disabilities, and what the ADA requires on the street and in exigencies.' },
  { id: 'custody-and-corrections', label: 'Custody and corrections', blurb: 'Pretrial detainees and sentenced prisoners, the standards that apply inside, and the PREA cases.' },
  { id: 'qualified-immunity', label: 'Qualified immunity', blurb: 'The reasonably well trained officer, clearly established law, and the specificity courts demand.' },
  { id: 'instructor-and-training-liability', label: 'Instructor and training liability', blurb: 'Failure to train, deliberate indifference, supervision, and the documentation that proves training happened.' },
  { id: 'training-injury', label: 'Training injury and assumption of risk', blurb: 'What an instructor owes a student hurt in a physical skills class, and where that duty ends.' },
  { id: 'california-law', label: 'California law', blurb: 'The state statutes and California decisions that bind California officers beyond the federal floor.' },
  { id: 'supervision-and-intercede', label: 'Supervision and the duty to intercede', blurb: 'Supervisor liability, the duty to step in, and what a bystander officer is expected to do.' },
];

export const categoryLabel: Record<CaseCategory, string> = Object.fromEntries(caseCategories.map((c) => [c.id, c.label])) as Record<CaseCategory, string>;
