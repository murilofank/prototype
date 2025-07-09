import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,           // para poder usar describe/it/expect sem importar sempre
    environment: 'node',     // ambiente Node.js (não browser)
    coverage: {
      reporter: ['text', 'html'], // cobertura em terminal + HTML
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
      ],
    },
  },
});