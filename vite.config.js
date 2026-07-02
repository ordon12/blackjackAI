import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// If you deploy to GitHub Pages at https://<username>.github.io/blackjack-ai/
// keep base as '/blackjack-ai/'. If you deploy to a custom domain or Vercel/Netlify,
// change base to '/'.
export default defineConfig({
  plugins: [react()],
  // base: '/',
})
