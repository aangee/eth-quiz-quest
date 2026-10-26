import { defineConfig } from 'vitest/config';
import preact from '@preact/preset-vite';

export default defineConfig({
  base: '/eth-quiz-quest/',
  plugins: [preact()],
  test: { environment: 'node' },
});
