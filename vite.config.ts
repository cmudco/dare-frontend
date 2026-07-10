import { defineConfig } from 'vite'
import type { Plugin, ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { existsSync, readFileSync, statSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'path'

const contentTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

const docsDevServer = (): Plugin => {
  const docsOut = path.resolve(__dirname, 'docs-site/out')

  return {
    name: 'serve-exported-docs',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(
        (req: IncomingMessage, res: ServerResponse, next: () => void) => {
          if (!req.url?.startsWith('/docs') && !req.url?.startsWith('/_next')) {
            next()
            return
          }

          const pathname = decodeURIComponent(req.url.split('?')[0])
          const normalized = path
            .normalize(pathname)
            .replace(/^(\.\.[/\\])+/, '')
          let filePath = path.join(docsOut, normalized)

          if (existsSync(filePath) && statSync(filePath).isDirectory()) {
            filePath = path.join(filePath, 'index.html')
          } else if (!path.extname(filePath)) {
            filePath = path.join(filePath, 'index.html')
          }

          if (!filePath.startsWith(docsOut) || !existsSync(filePath)) {
            next()
            return
          }

          res.statusCode = 200
          res.setHeader(
            'Content-Type',
            contentTypes[path.extname(filePath)] ?? 'application/octet-stream'
          )
          res.end(readFileSync(filePath))
        }
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: false,
  },
  plugins: [docsDevServer(), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
