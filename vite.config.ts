
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ВАЖНО: ни при каких обстоятельствах не хардкодьте секреты в репозиторий.
// Ключи для доступа к внешним API должны передаваться через переменные окружения
// на стороне сервера / CI (например, Netlify Environment Variables).

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  }
});
