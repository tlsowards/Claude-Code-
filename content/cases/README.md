# Case library

One JSON file per standalone teaching brief. Add a file, rebuild, and it appears at `/cases/<id>` and on the Cases page. The shape is the weekly brief's case object plus a few fields; see `TeachingBrief` in `src/data/types.ts` and the "Publish a teaching brief" section of `docs/CONTENT-WORKFLOW.md`.

Required: `id` (the URL slug, lowercase with hyphens), `name`, `court`, `courtKey`, `decided`, `status`, `topic`, `settings`, `facts`, `holding`, `inPractice`, `trainIt`, `published` (ISO date added to the library), `summary` (one or two sentences, free to read).

Optional: `categories` (the library sections the brief belongs to, first one is where it is shelved; ids in `src/data/caseCategories.ts`: force-standards, deadly-force, intermediate-force, impact-weapons, takedowns-and-control, handcuffing-and-detention, restraint-and-asphyxia, mental-health-and-disability, custody-and-corrections, qualified-immunity, instructor-and-training-liability, training-injury, california-law, supervision-and-intercede), `docket`, `citation`, `dissent`, `notDecided`, `caution`, `coverage` (verification notes), `context` (short titled sections for related standards and the California layer, shown after the case), `applications` (briefing room points), `quiz` (three questions), `relatedBriefIds`.

Paragraph breaks inside `facts`, `holding`, and the other long fields are written as a blank line (`\n\n` in JSON) and render as paragraphs.

Free to read: the summary, facts, and holding. Subscribers only: practice and training points, briefing room points, and the knowledge check.
