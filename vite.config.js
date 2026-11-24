import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// GitHub Pages 저장소 하위 경로 배포를 위해 base 설정
export default defineConfig({
  base: '/my-community/',
  plugins: [react()],
});
