import fs from 'node:fs'
import path from 'node:path'

import type { Connect, Plugin } from 'vite'

const mimeByExt: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
}

const isPathInsideDir = (filePath: string, dirPath: string): boolean => {
  const resolvedFile = path.resolve(filePath)
  const resolvedDir = path.resolve(dirPath)

  if (process.platform === 'win32') {
    const f = resolvedFile.toLowerCase()
    const d = resolvedDir.toLowerCase()

    return f === d || f.startsWith(`${d}\\`)
  }

  return resolvedFile === resolvedDir || resolvedFile.startsWith(`${resolvedDir}${path.sep}`)
}

/**
 * Storybook 'staticDirs' parser mishandles Windows absolute paths ('C:' vs ':' segment split).
 * Requests like '/images/socialContactButtons/*.png' then 404. This middleware mirrors Vite
 * 'public/' serving for the real Quasar 'public' folder during 'storybook dev'.
 */
export const vitePluginServeRepoPublic = (absolutePublicDir: string): Plugin => ({
  name: 'fantasia-archive-serve-repo-public',
  enforce: 'pre',
  configureServer (server) {
    const root = path.normalize(path.resolve(absolutePublicDir))

    const handler: Connect.NextHandleFunction = (req, res, next) => {
      try {
        const rawUrl = req.url?.split('?')[0]

        if (rawUrl === undefined || rawUrl === '' || rawUrl === '/') {
          next()

          return
        }

        if (!rawUrl.startsWith('/')) {
          next()

          return
        }

        const pathPart = decodeURIComponent(rawUrl)

        if (pathPart.includes('\0')) {
          next()

          return
        }

        const rel = pathPart.replace(/^\/+/, '')
        const candidate = path.normalize(path.join(root, rel))

        if (!isPathInsideDir(candidate, root)) {
          next()

          return
        }

        if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) {
          next()

          return
        }

        const ext = path.extname(candidate).toLowerCase()

        res.statusCode = 200
        res.setHeader('Content-Type', mimeByExt[ext] ?? 'application/octet-stream')
        fs.createReadStream(candidate)
          .on('error', () => next())
          .pipe(res)
      } catch {
        next()
      }
    }

    /**
     * Run before Vite's own 'publicDir' static handler so a mis-merged config cannot 404 first.
     * 'stack' is connect internals; Vite's dev server uses it (see vitejs/vite#8320).
     */
    const stack = (server.middlewares as Connect.Server).stack

    stack.unshift({
      route: '',
      handle: handler
    })
  }
})
