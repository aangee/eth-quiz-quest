import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/eth-quiz-quest/',
  plugins: [
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icone.svg'],
      manifest: {
        name: 'Quiz Quest',
        short_name: 'Quiz Quest',
        lang: 'fr',
        start_url: '/eth-quiz-quest/',
        scope: '/eth-quiz-quest/',
        display: 'standalone',
        background_color: '#0b0720',
        theme_color: '#0b0720',
        icons: [
          { src: 'icone-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icone-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,svg,png,json,woff2}'] },
    }),
  ],
  test: { environment: 'node' },
});
