import { useEffect } from 'react';
import { site } from '../config';

export default function Seo({ title, description }: { title?: string; description?: string }) {
  useEffect(() => {
    document.title = title ? `${title} · ${site.name}` : site.appName;
    if (description) {
      let m = document.querySelector('meta[name="description"]');
      if (!m) {
        m = document.createElement('meta');
        m.setAttribute('name', 'description');
        document.head.appendChild(m);
      }
      m.setAttribute('content', description);
    }
  }, [title, description]);
  return null;
}
