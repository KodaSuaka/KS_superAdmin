import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Backend CORS hanya mengizinkan http://localhost:5173. strictPort bikin
    // dev server gagal keras kalau 5173 dipakai, daripada diam-diam pindah ke
    // 5174 lalu request-nya diblok CORS ("Gagal terhubung ke server").
    port: 5173,
    strictPort: true,
  },
})
