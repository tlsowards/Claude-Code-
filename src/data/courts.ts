import type { CourtKey } from './types';

/** Public opinion pages for each court. Domains only, so the links stay valid when the courts move pages. */
export const courtSites: Record<CourtKey, { name: string; url: string }> = {
  scotus: { name: 'Supreme Court of the United States', url: 'https://www.supremecourt.gov/' },
  ca1: { name: 'First Circuit', url: 'https://www.ca1.uscourts.gov/' },
  ca2: { name: 'Second Circuit', url: 'https://www.ca2.uscourts.gov/' },
  ca3: { name: 'Third Circuit', url: 'https://www.ca3.uscourts.gov/' },
  ca4: { name: 'Fourth Circuit', url: 'https://www.ca4.uscourts.gov/' },
  ca5: { name: 'Fifth Circuit', url: 'https://www.ca5.uscourts.gov/' },
  ca6: { name: 'Sixth Circuit', url: 'https://www.ca6.uscourts.gov/' },
  ca7: { name: 'Seventh Circuit', url: 'https://www.ca7.uscourts.gov/' },
  ca8: { name: 'Eighth Circuit', url: 'https://www.ca8.uscourts.gov/' },
  ca9: { name: 'Ninth Circuit', url: 'https://www.ca9.uscourts.gov/' },
  ca10: { name: 'Tenth Circuit', url: 'https://www.ca10.uscourts.gov/' },
  ca11: { name: 'Eleventh Circuit', url: 'https://www.ca11.uscourts.gov/' },
  cadc: { name: 'D.C. Circuit', url: 'https://www.cadc.uscourts.gov/' },
  calsupreme: { name: 'California Supreme Court', url: 'https://www.courts.ca.gov/' },
  calapp: { name: 'California Court of Appeal', url: 'https://www.courts.ca.gov/' },
};

/** CourtListener (Free Law Project) full-text search for a case name. */
export function courtListenerSearch(caseName: string): string {
  return `https://www.courtlistener.com/?q=${encodeURIComponent(`"${caseName}"`)}`;
}
