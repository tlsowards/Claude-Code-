type P = { className?: string };
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, viewBox: '0 0 24 24', 'aria-hidden': true };

export const HomeIcon = ({ className }: P) => (
  <svg {...base} className={className}><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10.5V20h14v-9.5" /><path d="M10 20v-6h4v6" /></svg>
);
export const BriefIcon = ({ className }: P) => (
  <svg {...base} className={className}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>
);
export const PodcastIcon = ({ className }: P) => (
  <svg {...base} className={className}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3M9 21h6" /></svg>
);
export const TrainingIcon = ({ className }: P) => (
  <svg {...base} className={className}><path d="M3 8l9-4 9 4-9 4-9-4z" /><path d="M7 10v5c0 1.5 2.5 3 5 3s5-1.5 5-3v-5" /><path d="M21 8v6" /></svg>
);
export const ResourcesIcon = ({ className }: P) => (
  <svg {...base} className={className}><path d="M4 5h6a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H4z" /><path d="M20 5h-6a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h7z" /></svg>
);
export const CasesIcon = ({ className }: P) => (
  <svg {...base} className={className}><path d="M12 3v18" /><path d="M5 7h14" /><path d="M5 7l-3 7a3 3 0 0 0 6 0L5 7z" /><path d="M19 7l-3 7a3 3 0 0 0 6 0l-3-7z" /><path d="M8 21h8" /></svg>
);
