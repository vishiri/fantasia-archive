import { app, net, protocol } from 'electron'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

/**
 * Custom URL scheme used by the packaged renderer in place of 'file://'. Choosing a privileged
 * 'standard' + 'secure' + 'supportFetchAPI' scheme means web workers and fetch'd ESM chunks
 * created by Vite (for example Monaco's editor.worker / css.worker) load identically to the dev
 * server origin and avoid the Electron file:// quirks around module workers.
 */
export const FA_APP_PROTOCOL_SCHEME = 'app'

/**
 * Authority used in the URL after the scheme. Kept literal so 'app://./index.html' resolves to
 * 'index.html' relative to the resolved renderer root.
 */
export const FA_APP_PROTOCOL_HOST = '.'

let registeredAsPrivileged = false
let handlerInstalled = false

/**
 * Resolves the on-disk renderer root the privileged protocol should serve. After Quasar bundles
 * the main process, 'electron-main.js' sits next to the renderer's 'index.html' (UnPackaged/ for
 * dev test builds and Resources/app.asar/ for packaged builds), so the renderer root is simply the
 * directory of the running main bundle. In dev mode the Quasar dev server is used instead and this
 * folder is unused.
 */
function resolveRendererRoot (): string {
  return fileURLToPath(new URL('.', import.meta.url))
}

/**
 * Registers the 'app://' scheme as privileged. Must be called BEFORE 'app.whenReady()'.
 * Idempotent: subsequent calls are a no-op.
 */
export function registerFaAppProtocolAsPrivileged (): void {
  if (registeredAsPrivileged) {
    return
  }
  registeredAsPrivileged = true
  protocol.registerSchemesAsPrivileged([
    {
      scheme: FA_APP_PROTOCOL_SCHEME,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
        stream: true
      }
    }
  ])
}

/**
 * Installs the actual 'app://' handler. Must be called AFTER 'app.whenReady()' so 'protocol.handle'
 * is available. Idempotent: subsequent calls are a no-op.
 */
export function installFaAppProtocolHandler (): void {
  if (handlerInstalled) {
    return
  }
  handlerInstalled = true

  const rendererRoot = resolveRendererRoot()

  protocol.handle(FA_APP_PROTOCOL_SCHEME, (request) => {
    const url = new URL(request.url)
    const rawPath = decodeURIComponent(url.pathname)
    // Strip leading slashes so 'path.join' resolves relative to 'rendererRoot' instead of escaping it.
    const normalized = rawPath.replace(/^\/+/, '')
    const resolved = path.normalize(path.join(rendererRoot, normalized || 'index.html'))

    // Defense in depth: refuse traversal outside the renderer root.
    if (!resolved.startsWith(rendererRoot)) {
      return new Response('Forbidden', { status: 403 })
    }

    return net.fetch(pathToFileURL(resolved).toString())
  })
}

/**
 * One-shot helper for the main process bootstrap: schedules the privileged registration immediately
 * (always safe) and installs the handler once the app is ready.
 */
export function setupFaAppProtocol (): void {
  registerFaAppProtocolAsPrivileged()
  app.whenReady().then(() => {
    installFaAppProtocolHandler()
  }).catch((error: unknown) => {
    console.error('[faAppProtocol] failed to install app:// handler', error)
  })
}
