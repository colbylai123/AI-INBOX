import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

// Link previews need absolute URLs, so og:url and og:image are added only when the
// build knows the site's address: SITE_URL (the real domain), or on Cloudflare Pages,
// the deployment's own URL. Without either, previews still get a title and text.
function linkPreview(siteUrl = process.env.SITE_URL || process.env.CF_PAGES_URL): Plugin {
  return {
    name: 'link-preview',
    transformIndexHtml() {
      if (!siteUrl) return []
      const base = siteUrl.replace(/\/+$/, '')
      return [
        { tag: 'meta', attrs: { property: 'og:url', content: `${base}/` }, injectTo: 'head' },
        {
          tag: 'meta',
          attrs: { property: 'og:image', content: `${base}/og-image.png` },
          injectTo: 'head',
        },
      ]
    },
  }
}

export default defineConfig({
  plugins: [
    // Must come before react(): generates src/routeTree.gen.ts from src/routes.
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    linkPreview(),
  ],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
