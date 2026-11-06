import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// BASE_PATH lets the app be served from a sub-folder of sowardsconsulting.com,
// for example "/app/". Default is the site root.
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.svg', 'podcast/feed.xml'],
      manifest: {
        name: 'Sowards Consulting Training',
        short_name: 'Sowards',
        description:
          'Weekly use of force briefs, the Use of Force Case Law Update podcast, STC-certified training, and resources for trainers.',
        theme_color: '#1B2A4E',
        background_color: '#1B2A4E',
        display: 'standalone',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icons/icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,xml,woff2}'],
        navigateFallback: `${base}index.html`,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: ({ request }) => request.destination === 'audio',
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
});
