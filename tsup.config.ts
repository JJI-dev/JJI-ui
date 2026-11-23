import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  target: 'es2020',
  // Next App Router에서 클라이언트 컴포넌트로 인식되도록
  banner: { js: '"use client";' },
  external: ['react', 'react-dom', 'next', 'next/link'],
})
