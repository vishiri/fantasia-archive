import fs from 'node:fs'

import { type BrowserWindow, type WebContents, app } from 'electron'

import { FA_PROJECT_OS_OPEN_IPC } from 'app/src-electron/electron-ipc-bridge'

import { resolveOsOpenFaProjectPathFromArgv } from './faProjectOsOpenArgv'
import { pathLooksLikeFaProjectFile } from './faProjectPathValidation'

let pendingOsOpenPath: string | null = null
let rendererReportedReady = false
let mainWebContents: WebContents | null = null
let listenersInstalled = false
let windowHooksRegistered = false

function isFaProjectOsOpenEnvironmentDisabled (): boolean {
  const envTest = process.env.TEST_ENV
  if (envTest === 'components') {
    return true
  }
  // Playwright E2E sets TEST_ENV to e2e; argv replay is explicit-only so normal suites stay splash-only.
  if (envTest === 'e2e' && process.env.FA_E2E_OS_OPEN !== '1') {
    return true
  }
  if (process.env.DEV && process.env.FA_DEV_OPEN_FAPROJECT !== '1') {
    return true
  }
  return false
}

function normalizeEnqueueCandidate (raw: string): string | null {
  const trimmed = raw.trim()
  if (!pathLooksLikeFaProjectFile(trimmed)) {
    return null
  }
  if (!fs.existsSync(trimmed)) {
    return null
  }
  return trimmed
}

function tryFlushPendingOsOpenToRenderer (): void {
  if (pendingOsOpenPath === null || mainWebContents === null) {
    return
  }
  if (mainWebContents.isDestroyed()) {
    return
  }
  if (!rendererReportedReady) {
    return
  }
  const filePath = pendingOsOpenPath
  pendingOsOpenPath = null
  mainWebContents.send(
    FA_PROJECT_OS_OPEN_IPC.openFromOsToRenderer,
    { filePath }
  )
}

/**
 * Queues the latest OS-provided path (replaces prior pending). Latest wins when bursts arrive before flush.
 */
export function enqueueFaProjectOsOpenPath (rawPath: string): void {
  if (isFaProjectOsOpenEnvironmentDisabled()) {
    return
  }
  const normalized = normalizeEnqueueCandidate(rawPath)
  if (normalized === null) {
    return
  }
  pendingOsOpenPath = normalized
  tryFlushPendingOsOpenToRenderer()
}

export function onFaProjectOsOpenRendererReady (): void {
  rendererReportedReady = true
  tryFlushPendingOsOpenToRenderer()
}

/**
 * Registers platform listeners before the first BrowserWindow (macOS open-file ordering).
 */
export function installFaProjectOsOpenListeners (): void {
  if (listenersInstalled || isFaProjectOsOpenEnvironmentDisabled()) {
    return
  }
  listenersInstalled = true

  if (process.platform === 'darwin') {
    app.on('open-file', (event, filePath) => {
      event.preventDefault()
      enqueueFaProjectOsOpenPath(filePath)
    })
  }

  app.on('second-instance', (_event, commandLine) => {
    const next = resolveOsOpenFaProjectPathFromArgv(commandLine)
    if (next !== null) {
      enqueueFaProjectOsOpenPath(next)
    }
  })

  void app.whenReady().then(() => {
    const cold = resolveOsOpenFaProjectPathFromArgv(process.argv)
    if (cold !== null) {
      enqueueFaProjectOsOpenPath(cold)
    }
  })
}

/**
 * Wires the main BrowserWindow webContents for flush (after load + renderer boot handshake).
 */
export function registerFaProjectOsOpenMainWindow (win: BrowserWindow): void {
  if (isFaProjectOsOpenEnvironmentDisabled() || windowHooksRegistered) {
    return
  }
  windowHooksRegistered = true
  mainWebContents = win.webContents
  rendererReportedReady = false

  win.webContents.on('did-finish-load', () => {
    tryFlushPendingOsOpenToRenderer()
  })
}
