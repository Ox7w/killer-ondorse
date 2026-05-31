import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' keeps asset paths relative so the build works on GitHub Pages
// under any repo subpath (e.g. https://user.github.io/Killer-Ondorse/).
export default defineConfig({
  plugins: [react()],
  base: './',
})
